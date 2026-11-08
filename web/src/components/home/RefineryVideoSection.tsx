import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { getNetworkTier } from '@/lib/network'
import { PREVIEW, createClipQueue, createScrubLayer, pickFull, richEffects } from '@/lib/videoScrub'
import { resolveMedia } from '@/data/media'
import { REFINERY_BEATS } from '@/data/homeChapters'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Container } from '@/components/Container'
import { Texture } from '@/components/Texture'
import { AccentTitle } from '@/components/home/AccentTitle'
import { Picture } from '@/components/Picture'

gsap.registerPlugin(ScrollTrigger)

/** Cross-fade length for captions, in seconds of footage. */
const FADE = 0.45
/** Scroll length of the whole film, in svh: 17 s of footage over about 8.5 screens, then the dissolve. */
const LENGTH = 1000
/**
 * How quickly the playhead catches up with the scroll position (lower is slower
 * and silkier). Raised from 0.055 now that seeks are cheap: at the old value the
 * footage trailed a quick flick on mobile by over a second.
 */
const EASE = 0.09
/** Share of the scroll at the end spent dissolving into the next section. */
const OUTRO = 0.15

/**
 * 02 — Refinery operations. The refinery clip fills the screen and is scrubbed
 * by scroll in slow motion. Each caption is pinned to the shot it describes
 * (tank farm → distillation columns → pump and pipework → panorama). At the
 * end a soft wipe rises in the next section's paper colour and grid, so the
 * film dissolves straight into the Services section with no visible edge.
 */
export function RefineryVideoSection() {
  const media = resolveMedia('home.refinery')
  const wrapRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLVideoElement>(null)
  const fullRef = useRef<HTMLVideoElement>(null)
  const beatRefs = useRef<(HTMLDivElement | null)[]>([])
  const mediaRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const outroRef = useRef<HTMLDivElement>(null)
  const seamGridRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const wrap = wrapRef.current
    const preview = previewRef.current
    const full = fullRef.current
    if (!wrap || !preview || !full || !media) return
    const ctrl = new AbortController()
    const fast = getNetworkTier() === 'fast'
    const dur = () => {
      for (const v of [full, preview]) if (Number.isFinite(v.duration) && v.duration > 0) return v.duration
      return 17.04
    }
    const fx = richEffects()
    const layer = createScrubLayer({ preview, full }, EASE, ctrl.signal)
    // Preview first (under 2 MB, so the footage moves immediately), then full quality.
    const queue = createClipQueue(1, (_, t) => layer.load(t, t === PREVIEW ? media.asset.sources.preview : pickFull(media.asset.sources, fast)))

    // Start downloading a few screens before the section arrives.
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return
        io.disconnect()
        queue.focus(0)
      },
      { rootMargin: '300% 0px' },
    )
    io.observe(wrap)

    // Continue the next section's grid fade across the seam: the Services grid
    // is masked by an ellipse sized to that section, so project the same
    // ellipse up into the overlay (whose bottom edge meets the section's top).
    const syncSeam = () => {
      const next = document.getElementById('services')
      const grid = seamGridRef.current
      if (!next || !grid) return
      const W = next.offsetWidth
      const H = next.offsetHeight
      const V = grid.offsetHeight
      const mask = `radial-gradient(ellipse ${(0.8 * W).toFixed(0)}px ${(0.7 * H).toFixed(0)}px at 50% ${(V + 0.3 * H).toFixed(0)}px, #000 25%, transparent 80%)`
      grid.style.maskImage = mask
      grid.style.webkitMaskImage = mask
    }
    syncSeam()
    window.addEventListener('resize', syncSeam)

    const apply = (p: number) => {
      const t = clamp(p / (1 - OUTRO)) * (dur() - 0.06)
      const o = clamp((p - (1 - OUTRO)) / OUTRO)
      const textOut = 1 - clamp(o * 2.4)
      layer.set(t)
      REFINERY_BEATS.forEach((b, i) => {
        const el = beatRefs.current[i]
        if (!el) return
        const fi = i === 0 ? 1 : clamp((t - b.from) / FADE + 0.5)
        const fo = i === REFINERY_BEATS.length - 1 ? 1 : clamp((b.to - t) / FADE + 0.5)
        const op = Math.min(fi, fo) * textOut
        el.style.opacity = op.toFixed(3)
        el.style.visibility = op < 0.01 ? 'hidden' : 'visible'
        const shift = o > 0 ? -40 * (1 - textOut) : (1 - Math.min(fi, fo)) * (t < b.from ? 36 : -36)
        el.style.transform = Math.abs(shift) < 0.1 ? '' : `translate3d(0, ${shift.toFixed(1)}px, 0)`
      })
      if (titleRef.current) titleRef.current.style.opacity = textOut.toFixed(3)
      if (mediaRef.current) {
        mediaRef.current.style.transform = o > 0 ? `scale(${(1 + o * 0.08).toFixed(4)})` : ''
        // A full-screen video blur every frame is too heavy for phones; they get the scale and wipe only.
        if (fx) mediaRef.current.style.filter = o > 0 ? `blur(${(o * 8).toFixed(2)}px) saturate(${(1 - o * 0.4).toFixed(3)})` : ''
      }
      const outro = outroRef.current
      if (outro) {
        // A soft-edged wipe rising from the bottom: fully hidden at o = 0, fully opaque at o = 1.
        const edge = o * 140 - 40
        const mask = `linear-gradient(to top, #000 ${edge.toFixed(2)}%, transparent ${(edge + 40).toFixed(2)}%)`
        outro.style.maskImage = mask
        outro.style.webkitMaskImage = mask
        outro.style.visibility = o <= 0 ? 'hidden' : 'visible'
      }
    }

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => {
        syncSeam()
        apply(self.progress)
      },
    })
    apply(reduced ? 0 : st.progress)

    // Frame loop runs only while the section is on screen.
    let raf = 0
    let last = 0
    const loop = (now: number) => {
      layer.tick(last ? (now - last) / 1000 : 1 / 60, true)
      last = now
      raf = requestAnimationFrame(loop)
    }
    const onScreen = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      last = 0
      if (e?.isIntersecting && !reduced) raf = requestAnimationFrame(loop)
    })
    onScreen.observe(wrap)

    return () => {
      cancelAnimationFrame(raf)
      onScreen.disconnect()
      window.removeEventListener('resize', syncSeam)
      io.disconnect()
      queue.stop()
      st.kill()
      ctrl.abort()
      layer.destroy()
    }
  }, [media, reduced])

  return (
    <section ref={wrapRef} id="refinery" className="relative bg-midnight" style={{ height: reduced ? '100svh' : `${LENGTH}svh` }} aria-label="Refinery operations">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Footage, full screen */}
        <div ref={mediaRef} className="absolute inset-0 will-change-transform">
          {media && <Picture src={media.asset.poster} small={media.asset.posterSmall} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          {/* Preview (below) and full quality (above); each fades in over the poster when ready. */}
          <video ref={previewRef} {...VIDEO_PROPS} />
          <video ref={fullRef} {...VIDEO_PROPS} />
        </div>

        {/* Legibility washes */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-midnight/85 via-midnight/35 via-45% to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-midnight via-midnight/60 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-midnight/70 to-transparent" />
        <Texture variant="noise" />

        <Container className="relative flex h-full flex-col pb-16 pt-32 md:pb-20 md:pt-36">
          {/* Section title */}
          <div ref={titleRef}>
            <p className="flex items-center gap-3">
              <span className="label-tech text-teal-300">02</span>
              <span className="h-px w-10 bg-gradient-to-r from-emerald to-silver/0" aria-hidden />
              <span className="font-display font-expanded text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-silver">Refinery operations</span>
            </p>
            <h2 className="mt-4 font-display text-2xl font-bold text-white/90 md:text-3xl">
              Where crude becomes <em>value</em>.
            </h2>
          </div>

          {/* Caption for the shot on screen */}
          <div className="relative mt-auto min-h-[18rem] md:min-h-[17rem]">
            {REFINERY_BEATS.map((b, i) => (
              <div
                key={b.title}
                ref={(el) => {
                  beatRefs.current[i] = el
                }}
                className="absolute inset-x-0 bottom-0 max-w-3xl will-change-transform"
                style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden' }}
              >
                <p className="flex items-center gap-3 label-tech text-emerald">
                  <span>Chapter {String(i + 1).padStart(2, '0')}</span>
                  <span className="h-px w-8 bg-emerald/60" aria-hidden />
                  <span className="text-white/70">{b.step}</span>
                </p>
                <h3 className="mt-4 text-display-lg font-bold text-white drop-shadow-[0_4px_30px_rgb(3_13_29/0.5)]">
                  <AccentTitle title={b.title} accent={b.accent} />
                </h3>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">{b.body}</p>
                {i === REFINERY_BEATS.length - 1 && (
                  <Link
                    to="/industries/petrochemical"
                    className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-500 hover:border-emerald hover:bg-emerald hover:text-midnight"
                  >
                    Refining &amp; petrochemicals <ArrowRight className="size-4" aria-hidden />
                  </Link>
                )}
              </div>
            ))}
          </div>

        </Container>

        {/* Dissolve into the next section: its paper colour, grid and glow */}
        <div ref={outroRef} aria-hidden className="pointer-events-none absolute inset-0 bg-paper" style={{ visibility: 'hidden' }}>
          {/* Same grid as the Services section, aligned to the bottom edge and masked to continue its fade */}
          <div
            ref={seamGridRef}
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgb(7 59 117 / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(7 59 117 / 0.06) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
              backgroundPosition: 'left bottom',
            }}
          />
          {/* Upper part of the Services section's top-left glow, which that section clips at its edge */}
          <div className="absolute -left-40 size-[34rem] rounded-full bg-electric/10 blur-[120px]" style={{ bottom: 'calc(160px - 34rem)' }} />
        </div>
      </div>
    </section>
  )
}

const VIDEO_PROPS = {
  muted: true,
  playsInline: true,
  preload: 'auto',
  disablePictureInPicture: true,
  tabIndex: -1,
  'aria-hidden': true,
  className: 'absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500',
} as const

function clamp(n: number): number {
  return Math.min(1, Math.max(0, n))
}
