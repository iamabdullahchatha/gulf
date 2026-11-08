import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronsDown } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/cn'
import { buttonStyles } from '@/lib/buttonStyles'
import { getNetworkTier } from '@/lib/network'
import { FULL, PREVIEW, createClipQueue, createScrubLayer, pickFull, richEffects } from '@/lib/videoScrub'
import { scrollToElement } from '@/lib/lenis'
import { resolveMedia } from '@/data/media'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Texture } from '@/components/Texture'
import { AccentTitle } from '@/components/home/AccentTitle'
import type { FilmBeat, FilmScene } from '@/data/homeChapters'
import { Picture } from '@/components/Picture'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Scroll length of one scene, in svh. */
const SEG = 140
/** Fraction at the end of each scene during which the next shot dissolves in. */
const TR = 0.3
/** Seconds of the incoming clip that play during the dissolve, so both shots stay in motion. */
const LEAD = 0.6
/** Cross-fade length for text, in seconds of footage. */
const FADE = 0.35

interface Cta {
  label: string
  href: string
}

export interface FilmHero {
  eyebrow: string
  words: string[]
  /** Word rendered in the brushed-metal gradient. */
  metallic?: string
  ctas: Cta[]
  /** CSS font-size for the headline; long headlines can step down. */
  fontSize?: string
}

interface Props {
  scenes: FilmScene[]
  /** Element id the "Skip" control scrolls to. */
  skipTo: string
  /** Headline and buttons on the opening beat. Defaults to the homepage. */
  hero?: FilmHero
  /** Buttons on the closing beat. */
  finale?: Cta[]
  /** Scroll length of one scene, in svh. */
  segment?: number
  /** How quickly the footage catches up with the scroll position (0–1). Lower is silkier and slower. */
  ease?: number
  label?: string
}

const HOME_HERO: FilmHero = {
  eyebrow: 'GULF NEXT Oil and Gas',
  words: ['ENGINEERING', 'THE', 'ENERGY', 'FUTURE.'],
  metallic: 'ENERGY',
  ctas: [
    { label: 'Explore our capabilities', href: '/services' },
    { label: 'Contact our team', href: '/contact' },
  ],
}
const HOME_FINALE: Cta[] = [
  { label: 'Discover our story', href: '/about' },
  { label: 'Contact our team', href: '/contact' },
]

/**
 * The homepage film — every approved scene, played as ONE continuous shot
 * driven by scroll.
 *
 *  - Scroll position is the playhead: scroll down and the footage advances,
 *    scroll up and it reverses, stop and it holds on that frame.
 *  - Words are pinned to the seconds of footage they describe.
 *  - Joins are invisible by design: the outgoing shot keeps moving and pushing
 *    in while the incoming shot (already in motion) dissolves over it, and a
 *    soft bloom of light carries the eye across the cut. There are no scene
 *    numbers, frames or chapter bars — it reads as a single journey.
 *
 * Loading is progressive: a <1 MB preview of each scene arrives first so the
 * footage moves straight away, then the full-quality clip crossfades in on the
 * same frame. Clips are held in memory and driven frame-by-frame by
 * `lib/videoScrub` (no redundant or overlapping seeks, time-based easing).
 * Reduced motion / Save-Data: a static sequence of stills with the same copy.
 */
export function CinematicFilm(props: Props) {
  const reduced = usePrefersReducedMotion()
  const scrub = !reduced && getNetworkTier() !== 'none'
  return scrub ? <FilmStage {...props} /> : <FilmStatic {...props} />
}

/* -------------------------------------------------------------------------- */

function FilmStage({ scenes, skipTo, hero = HOME_HERO, finale = HOME_FINALE, segment = SEG, ease = 0.35, label = 'GULF NEXT — engineering the energy future' }: Props) {
  const N = scenes.length
  const wrapRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const bloomRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  /** Per scene: [preview, full] video elements. */
  const videoRefs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null][]>(scenes.map(() => [null, null]))
  const beatRefs = useRef<(HTMLDivElement | null)[][]>(scenes.map(() => []))
  const ctaRefs = useRef<(HTMLDivElement | null)[]>([])

  // Hero intro: words rise out of a mask, copy and controls follow.
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.2 })
      tl.from('[data-word]', { yPercent: 115, duration: 1.4, stagger: 0.08 }).from('[data-hero-fade]', { opacity: 0, y: 22, duration: 1.1, stagger: 0.1 }, '-=0.95')
    },
    { scope: wrapRef },
  )

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const tier = getNetworkTier()
    const fx = richEffects()
    const ctrl = new AbortController()
    const layers = scenes.map((_, j) => {
      const [preview, full] = videoRefs.current[j] ?? []
      if (!preview || !full) return null
      return createScrubLayer({ preview, full }, ease, ctrl.signal, () => layerRefs.current[j]?.classList.add('is-ready'))
    })
    let lastAlign = ''

    // Previews of every scene plus full-quality clips, one download at a time
    // in order of need (see lib/videoScrub). On 3G, full quality is only
    // fetched for the neighbouring scenes.
    const queue = createClipQueue(
      N,
      async (j, t) => {
        const media = resolveMedia(scenes[j]!.section)
        if (!media) return
        const src = t === PREVIEW ? media.asset.sources.preview : pickFull(media.asset.sources, tier === 'fast')
        await layers[j]?.load(t, src)
      },
      // Fast connections skip the 360p preview and go straight to full quality.
      { fullWindow: tier === 'fast' ? undefined : 2, previews: tier !== 'fast' },
    )

    const duration = (j: number) => {
      for (const v of videoRefs.current[j] ?? []) if (v && Number.isFinite(v.duration) && v.duration > 0) return v.duration
      return 8.04
    }
    /** Clip time for scene j at in-scene progress p (0–1). Scenes after the first start LEAD seconds in. */
    const timeAt = (j: number, p: number) => {
      const lead = j === 0 ? 0 : LEAD
      return lead + p * (duration(j) - lead - 0.06)
    }

    const apply = (p: number) => {
      const g = Math.min(p * N, N - 1e-6)
      const i = Math.floor(g)
      const local = g - i
      const k = i < N - 1 && local > 1 - TR ? (local - (1 - TR)) / TR : 0
      const ek = easeInOut(k)

      queue.focus(k > 0.5 ? i + 1 : i)

      layers[i]?.set(timeAt(i, local))
      if (k > 0) layers[i + 1]?.set(k * LEAD)

      layerRefs.current.forEach((el, j) => {
        if (!el) return
        if (j === i) {
          setLayer(el, 'visible', '1', '1', `scale(${(1 + local * 0.08 + ek * 0.12).toFixed(4)})`)
        } else if (j === i + 1 && k > 0) {
          setLayer(el, 'visible', '2', ek.toFixed(3), `scale(${(1.1 - 0.1 * ek).toFixed(4)})`)
        } else {
          setLayer(el, 'hidden')
        }
      })

      // Soft bloom of light at the midpoint of each join.
      const bloom = bloomRef.current
      if (bloom) {
        const b = Math.sin(Math.PI * k) * 0.55
        bloom.style.opacity = b.toFixed(3)
        bloom.style.visibility = b < 0.005 ? 'hidden' : 'visible'
      }

      const t = timeAt(i, local)
      const current = scenes[i]!
      const beatNow = current.beats.find((b) => t < b.to) ?? current.beats[current.beats.length - 1]
      const align = beatNow?.align ?? current.align
      if (align !== lastAlign) {
        lastAlign = align
        if (overlayRef.current) overlayRef.current.style.background = overlayFor(align)
      }
      const textOut = 1 - clamp(k * 3)
      scenes.forEach((scene, j) => {
        const els = beatRefs.current[j] ?? []
        let actionVisible = 0
        scene.beats.forEach((beat, b) => {
          const el = els[b]
          if (!el) return
          const isLast = b === scene.beats.length - 1
          const o = j === i ? beatOpacity(t, beat, b === 0, isLast) * textOut : 0
          if (isActionBeat(j, b, N, scene)) actionVisible = Math.max(actionVisible, o)
          setVisible(el, o, t < beat.from ? 26 : -26, fx)
        })
        const cta = ctaRefs.current[j]
        if (cta) setVisible(cta, j === i ? textOut * (1 - actionVisible) : 0, 12, fx)
      })

      if (cueRef.current) cueRef.current.style.opacity = String(clamp(1 - p * N * 4))
    }

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    })
    apply(st.progress)

    // Only run the frame loop while the film is on screen.
    let raf = 0
    let last = 0
    const loop = (now: number) => {
      const dt = last ? (now - last) / 1000 : 1 / 60
      last = now
      layers.forEach((l, j) => l?.tick(dt, layerRefs.current[j]?.style.visibility !== 'hidden'))
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      last = 0
      if (e?.isIntersecting) raf = requestAnimationFrame(loop)
    })
    io.observe(wrap)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      queue.stop()
      st.kill()
      ctrl.abort()
      layers.forEach((l) => l?.destroy())
    }
  }, [scenes, N, ease])

  const skip = () => {
    const el = document.getElementById(skipTo)
    if (el) scrollToElement(el)
  }

  return (
    <section ref={wrapRef} className="relative" style={{ height: `${N * segment + 100}svh` }} aria-label={label} data-hero>
      {/* Invisible deep-link anchors (e.g. /#offshore). */}
      {scenes.map((s, j) => (
        <div key={s.id} id={s.id} aria-hidden className="pointer-events-none absolute inset-x-0" style={{ top: `${j * segment}svh`, height: `${segment}svh` }} />
      ))}

      <div className="sticky top-0 h-svh overflow-hidden bg-abyss">
        {scenes.map((s, j) => {
          const media = resolveMedia(s.section)
          return (
            <div
              key={s.id}
              ref={(el) => {
                layerRefs.current[j] = el
              }}
              aria-hidden
              className="group/layer absolute inset-0 will-change-[opacity,transform]"
              style={{ visibility: j === 0 ? 'visible' : 'hidden' }}
            >
              {media && (
                <Picture small={media.asset.posterSmall}
                    src={media.asset.poster}
                    alt=""
                    loading={j < 2 ? 'eager' : 'lazy'}
                    fetchPriority={j === 0 ? 'high' : undefined}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
              )}
              {/* Preview (below) and full quality (above); each fades in over the poster when ready. */}
              {([PREVIEW, FULL] as const).map((t) => (
                <video
                  key={t}
                  ref={(el) => {
                    ;(videoRefs.current[j] ??= [null, null])[t] = el
                  }}
                  muted
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  disableRemotePlayback
                  tabIndex={-1}
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500"
                />
              ))}
            </div>
          )
        })}

        {/* Light bloom that carries the eye across each join */}
        <div
          ref={bloomRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[3] opacity-0 mix-blend-screen"
          style={{ visibility: 'hidden', background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgb(255 240 220 / 0.55), rgb(108 182 242 / 0.25) 45%, transparent 75%)' }}
        />

        <div ref={overlayRef} aria-hidden className="pointer-events-none absolute inset-0 z-[4]" style={{ background: overlayFor(scenes[0]?.beats[0]?.align ?? scenes[0]?.align ?? 'center') }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[4] bg-[radial-gradient(ellipse_120%_95%_at_50%_50%,transparent_58%,rgb(3_13_29/0.55)_100%)]" />
        <Texture variant="noise" className="z-[4]" />

        <div className="absolute inset-0 z-[6]">
          {scenes.map((scene, j) => (
            <SceneText
              key={scene.id}
              scene={scene}
              sceneIndex={j}
              total={N}
              hero={hero}
              finale={finale}
              beatRef={(b, el) => {
                ;(beatRefs.current[j] ??= [])[b] = el
              }}
              ctaRef={(el) => {
                ctaRefs.current[j] = el
              }}
            />
          ))}
        </div>

        {/* Scroll cue — fades away as soon as the journey starts */}
        <div ref={cueRef} aria-hidden className="pointer-events-none absolute bottom-7 left-1/2 z-[7] flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="label-tech text-silver/80">Scroll</span>
          <span className="flex h-9 w-5 items-start justify-center rounded-full border border-silver/40 p-1">
            <ArrowDown className="size-3 animate-bounce text-emerald" />
          </span>
        </div>

        <button
          type="button"
          onClick={skip}
          className="absolute bottom-6 right-5 z-[7] inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-midnight/30 px-3.5 py-2 label-tech text-white/75 backdrop-blur-md transition hover:border-white/50 hover:text-white md:right-8"
        >
          Skip <ChevronsDown className="size-3.5" aria-hidden />
        </button>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

interface SceneTextProps {
  scene: FilmScene
  sceneIndex: number
  total: number
  beatRef: (b: number, el: HTMLDivElement | null) => void
  ctaRef: (el: HTMLDivElement | null) => void
  hero: FilmHero
  finale: Cta[]
}

function SceneText({ scene, sceneIndex, total, beatRef, ctaRef, hero: heroCopy, finale }: SceneTextProps) {
  const first = sceneIndex === 0

  return (
    <>
      {scene.beats.map((beat, b) => {
        const hero = first && b === 0
        const final = sceneIndex === total - 1 && b === scene.beats.length - 1
        const right = (beat.align ?? scene.align) === 'right'
        const center = (beat.align ?? scene.align) === 'center'
        return (
          <div
            key={beat.title}
            ref={(el) => beatRef(b, el)}
            className={cn(
              'absolute inset-0 mx-auto flex max-w-7xl flex-col px-5 will-change-transform md:px-8 lg:px-12',
              center ? 'items-center justify-center text-center' : 'justify-end pb-28 md:pb-32',
              right && 'items-end text-right max-md:items-start max-md:text-left',
            )}
            style={{ opacity: hero ? 1 : 0, visibility: hero ? 'visible' : 'hidden' }}
          >
            <div className={cn(center ? 'max-w-4xl' : 'max-w-2xl')}>
              <p
                data-hero-fade={hero || undefined}
                className={cn('flex items-center gap-3 whitespace-nowrap', center && 'justify-center', right && 'justify-end max-md:justify-start')}
              >
                <span className="h-px w-10 bg-gradient-to-r from-emerald to-silver/0" aria-hidden />
                <span className="font-display font-expanded text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-silver sm:text-[0.72rem] sm:tracking-[0.28em]">
                  {hero ? heroCopy.eyebrow : scene.label}
                </span>
                {center && <span className="h-px w-10 bg-gradient-to-l from-emerald to-silver/0" aria-hidden />}
              </p>

              {hero ? (
                <HeroHeadline hero={heroCopy} />
              ) : (
                <h2 className={cn('mt-6 font-bold text-white drop-shadow-[0_4px_30px_rgb(3_13_29/0.55)]', final ? 'text-display-xl' : 'text-display-lg')}>
                  <AccentTitle title={beat.title} accent={beat.accent} />
                </h2>
              )}

              <p
                data-hero-fade={hero || undefined}
                className={cn(
                  'mt-6 text-base leading-relaxed text-white/85 md:text-lg',
                  hero ? 'mx-auto max-w-2xl md:text-xl' : 'max-w-xl',
                  center && 'mx-auto',
                  right && 'ml-auto max-md:ml-0',
                )}
              >
                {beat.body}
              </p>

              {hero && (
                <div data-hero-fade className={cn('mt-10 flex flex-wrap gap-3', center && 'justify-center')}>
                  {heroCopy.ctas.map((c, n) => (
                    <Link key={c.href} to={c.href} className={buttonStyles({ variant: n === 0 ? 'primary' : 'ghost', size: 'lg', className: 'uppercase tracking-[0.08em]' })}>
                      {c.label} {n > 0 && <ArrowUpRight className="size-4" aria-hidden />}
                    </Link>
                  ))}
                </div>
              )}

              {final && (
                <div className={cn('mt-10 flex flex-wrap gap-3', center && 'justify-center', right && 'justify-end max-md:justify-start')}>
                  {finale.map((c, n) => (
                    <Link key={c.href} to={c.href} className={buttonStyles({ variant: n === 0 ? 'primary' : 'ghost', size: 'lg' })}>
                      {c.label} {n > 0 && <ArrowUpRight className="size-4" aria-hidden />}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {scene.cta && (
        <div
          ref={ctaRef}
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-14 mx-auto flex max-w-7xl px-5 md:bottom-16 md:px-8 lg:px-12',
            scene.align === 'center' && 'justify-center',
            scene.align === 'right' && 'justify-end max-md:justify-start',
          )}
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <Link to={scene.cta.href} className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'pointer-events-auto' })}>
            {scene.cta.label} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      )}
    </>
  )
}

function HeroHeadline({ hero }: { hero: FilmHero }) {
  return (
    <h1 className="mt-8 font-display font-black uppercase leading-[0.9] tracking-[-0.03em]" style={{ fontSize: hero.fontSize ?? 'clamp(2.2rem, 7.6vw, 7.5rem)', fontStretch: '108%' }}>
      {hero.words.map((w, i) => (
        <span key={`${i}-${w}`}>
          <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
            <span data-word className={`inline-block ${w === hero.metallic ? 'text-metallic' : 'text-white'}`}>
              {w}
            </span>
          </span>
          {i < hero.words.length - 1 && ' '}
        </span>
      ))}
    </h1>
  )
}

/* -------------------------------------------------------------------------- */

function FilmStatic({ scenes, hero = HOME_HERO }: Props) {
  return (
    <div>
      {scenes.map((scene, j) => {
        const media = resolveMedia(scene.section)
        const isHero = j === 0
        return (
          <section key={scene.id} id={scene.id} className="relative isolate flex min-h-svh overflow-hidden" aria-label={scene.label}>
            {media && <Picture src={media.asset.poster} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />}
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/75 to-midnight/35" />
            <div className="mx-auto mt-auto w-full max-w-7xl px-5 pb-20 pt-32 md:px-8">
              <p className="label-tech text-teal-300">{scene.label}</p>
              {isHero ? (
                <HeroHeadline hero={hero} />
              ) : (
                <h2 className="mt-6 text-display-lg font-bold text-white">
                  <AccentTitle title={scene.beats[0]!.title} accent={scene.beats[0]!.accent} />
                </h2>
              )}
              <ul className="mt-8 grid max-w-4xl gap-6 border-t border-silver/15 pt-6 md:grid-cols-2">
                {scene.beats.map((b, n) => (
                  <li key={b.title}>
                    {n > 0 && <p className="font-display font-semibold text-white">{b.title}</p>}
                    <p className="mt-1 text-steel-300">{b.body}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                {isHero ? (
                  hero.ctas.map((c, n) => (
                    <Link key={c.href} to={c.href} className={buttonStyles({ variant: n === 0 ? 'primary' : 'ghost', size: 'lg', className: 'uppercase tracking-[0.08em]' })}>
                      {c.label}
                    </Link>
                  ))
                ) : (
                  scene.cta && (
                    <Link to={scene.cta.href} className={buttonStyles({ variant: 'ghost' })}>
                      {scene.cta.label} <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  )
                )}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function isActionBeat(sceneIdx: number, beatIdx: number, total: number, scene: FilmScene): boolean {
  return (sceneIdx === 0 && beatIdx === 0) || (sceneIdx === total - 1 && beatIdx === scene.beats.length - 1)
}

function beatOpacity(t: number, beat: FilmBeat, isFirst: boolean, isLast: boolean): number {
  const fadeIn = isFirst ? 1 : clamp((t - beat.from) / FADE + 0.5)
  const fadeOut = isLast ? 1 : clamp((beat.to - t) / FADE + 0.5)
  return Math.min(fadeIn, fadeOut)
}

/** Last state written to each element, so unchanged frames cost no style work. */
const written = new WeakMap<HTMLElement, string>()

/**
 * Fade/slide a text block. The soft blur is reserved for desktop pointers:
 * re-rasterising blurred headline text every frame is what makes phones drop
 * frames while scrolling.
 */
function setVisible(el: HTMLElement, o: number, shift: number, blur: boolean): void {
  const op = o.toFixed(3)
  const key = op + (o > 0.01 && o < 0.999 ? shift : '')
  if (written.get(el) === key) return
  written.set(el, key)
  el.style.opacity = op
  el.style.visibility = o < 0.01 ? 'hidden' : 'visible'
  el.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
  el.style.transform = o >= 0.999 ? '' : `translate3d(0, ${((1 - o) * shift).toFixed(1)}px, 0)`
  if (blur) el.style.filter = o >= 0.999 ? '' : `blur(${((1 - o) * 6).toFixed(1)}px)`
}

function setLayer(el: HTMLElement, visibility: 'visible' | 'hidden', z = '', opacity = '', transform = ''): void {
  const key = visibility === 'hidden' ? 'h' : `${z}|${opacity}|${transform}`
  if (written.get(el) === key) return
  written.set(el, key)
  el.style.visibility = visibility
  if (visibility === 'hidden') return
  el.style.zIndex = z
  el.style.opacity = opacity
  el.style.transform = transform
}

function overlayFor(align: FilmScene['align']): string {
  const tint = '6 23 47'
  const top = `linear-gradient(180deg, rgb(${tint} / 0.6) 0%, transparent 26%)`
  const bottom = `linear-gradient(0deg, rgb(${tint} / 0.88) 0%, rgb(${tint} / 0.3) 32%, transparent 58%)`
  if (align === 'center') {
    return [top, bottom, `radial-gradient(ellipse 75% 65% at 50% 52%, rgb(${tint} / 0.55) 0%, rgb(${tint} / 0.15) 100%)`].join(',')
  }
  const deg = align === 'right' ? 270 : 90
  return [top, bottom, `linear-gradient(${deg}deg, rgb(${tint} / 0.82) 0%, rgb(${tint} / 0.35) 45%, rgb(${tint} / 0.02) 100%)`].join(',')
}

function easeInOut(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

function clamp(n: number): number {
  return Math.min(1, Math.max(0, n))
}
