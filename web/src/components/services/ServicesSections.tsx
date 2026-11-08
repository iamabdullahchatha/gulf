import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Container } from '@/components/Container'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { SectionHeading } from '@/components/SectionHeading'
import { Texture } from '@/components/Texture'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { ServiceCard3D } from '@/components/cards/ServiceCard3D'
import { Picture } from '@/components/Picture'
import { cn } from '@/lib/cn'
import { scrollToElement } from '@/lib/lenis'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SERVICES, SERVICE_GROUPS, servicesIn, type Service } from '@/data/services'
import type { Industry } from '@/data/industries'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const pad = (n: number) => String(n).padStart(2, '0')
const groupOf = (slug: string) => SERVICE_GROUPS.find((g) => g.slugs.includes(slug))?.heading ?? ''

/* ----------------------------------------------------------------------------
 * Service lines: the nine services as a 3D deck of photo cards. Scrolling
 * deals the front card up and out toward the viewer and brings the next one
 * forward; the panel beside it describes the card in front.
 * Phones, tablets and reduced motion get the grouped 3D card grid instead.
 * ------------------------------------------------------------------------- */

export function ServiceDeck() {
  const reduced = usePrefersReducedMotion()
  const desktop = useMediaQuery('(min-width: 1024px)')
  return desktop && !reduced ? <DeckScroller /> : <DeckGrid />
}

function DeckScroller() {
  const ref = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const pos = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const [active, setActive] = useState(0)
  const N = SERVICES.length

  const paint = () => {
    const stack = stackRef.current
    if (!stack) return
    const { x, y } = pointer.current
    stack.style.transform = `rotateX(${(7 - y * 8).toFixed(2)}deg) rotateY(${(-16 + x * 14).toFixed(2)}deg)`
    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const d = i - pos.current
      let transform: string
      let opacity: number
      if (d < 0) {
        const k = Math.min(1, -d)
        transform = `translate3d(${(-k * 22).toFixed(1)}%, ${(-k * 120).toFixed(1)}%, ${(k * 180).toFixed(0)}px) rotateX(${(-k * 28).toFixed(1)}deg) rotateZ(${(-k * 9).toFixed(1)}deg)`
        opacity = Math.max(0, 1 - k * 1.5)
      } else {
        const k = Math.min(d, 4)
        transform = `translate3d(${(k * 8).toFixed(1)}%, ${(-k * 5).toFixed(1)}%, ${(-k * 130).toFixed(0)}px) rotateY(${(-k * 3).toFixed(1)}deg)`
        opacity = d > 3.4 ? Math.max(0, 1 - (d - 3.4) * 1.6) : 1
      }
      el.style.transform = transform
      el.style.opacity = opacity.toFixed(3)
      el.style.filter = d > 0.02 ? `brightness(${(1 - Math.min(d, 4) * 0.14).toFixed(3)}) saturate(${(1 - Math.min(d, 4) * 0.12).toFixed(3)})` : 'none'
      el.style.pointerEvents = Math.abs(d) < 0.5 ? 'auto' : 'none'
    })
  }

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.9,
        onUpdate: (self) => {
          pos.current = self.progress * (N - 1)
          paint()
          const a = Math.round(pos.current)
          setActive((prev) => (prev === a ? prev : a))
        },
      })
      paint()
      return () => st.kill()
    },
    { scope: ref },
  )

  const goTo = (i: number) => {
    const el = ref.current
    if (!el) return
    scrollToElement(el, ((el.offsetHeight - window.innerHeight) * i) / (N - 1))
  }

  const s = SERVICES[active]!
  const Icon = s.icon

  return (
    <section ref={ref} id="service-lines" className="relative scroll-mt-0 bg-deep" style={{ height: `${N * 55 + 100}svh` }} aria-label="Service lines">
      <div
        className="sticky top-0 flex h-svh items-center overflow-hidden pt-24"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          pointer.current = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }
          paint()
        }}
        onPointerLeave={() => {
          pointer.current = { x: 0, y: 0 }
          paint()
        }}
      >
        <Texture variant="grid" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_72%_55%,rgb(8_126_219/0.22),transparent_70%)]" />
        <div aria-hidden className="absolute -left-32 bottom-0 size-[32rem] rounded-full bg-emerald/10 blur-3xl" />

        <Container className="relative grid w-full items-center gap-12 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <SectionHeading reveal={false} size="md" index="01" eyebrow="Service lines" title={<>Nine disciplines. <em>One</em> point of accountability.</>} />

            <div key={s.slug} className="mt-9 min-h-[17.5rem] animate-[rise_.6s_var(--ease-out-expo)]">
              <p className="flex flex-wrap items-center gap-3 label-tech">
                <span className="text-emerald">Service {s.index}</span>
                <span className="h-px w-10 bg-gradient-to-r from-emerald to-transparent" aria-hidden />
                <span className="text-steel-500">{groupOf(s.slug)}</span>
              </p>
              <h3 className="mt-4 flex items-center gap-4 font-display text-3xl font-bold leading-tight text-white xl:text-[2.4rem]">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_14px_30px_-10px_rgb(0_185_154/0.8)]">
                  <Icon className="size-6" aria-hidden />
                </span>
                {s.title}
              </h3>
              <p className="mt-4 max-w-lg leading-relaxed text-steel-300">{s.description}</p>
              <ul className="mt-5 grid max-w-lg gap-x-5 gap-y-2 sm:grid-cols-2">
                {s.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-steel-200">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald" aria-hidden /> {h}
                  </li>
                ))}
              </ul>
              <Link to={`/services/${s.slug}`} className="link-underline mt-6 inline-flex items-center gap-2 font-semibold text-white">
                Explore the service <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Service lines">
                {SERVICES.map((x, i) => (
                  <button
                    key={x.slug}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={x.title}
                    onClick={() => goTo(i)}
                    className={cn('h-1.5 rounded-full transition-all duration-500', i === active ? 'w-10 bg-gradient-to-r from-emerald to-electric' : 'w-4 bg-silver/20 hover:bg-silver/50')}
                  />
                ))}
              </div>
              <span className="label-tech text-steel-500">
                <span className="text-white">{pad(active + 1)}</span> / {pad(N)}
              </span>
            </div>
          </div>

          <div className="relative h-[37rem] [perspective:1800px]">
            <div aria-hidden className="absolute bottom-6 left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-[50%] bg-electric/25 blur-3xl" />
            <div ref={stackRef} className="absolute inset-0 transition-transform duration-500 ease-out [transform-style:preserve-3d]">
              {SERVICES.map((x, i) => {
                const XIcon = x.icon
                return (
                  <div
                    key={x.slug}
                    ref={(el) => {
                      cardRefs.current[i] = el
                    }}
                    className="absolute left-1/2 top-1/2 -ml-[12.5rem] -mt-[16rem] h-[32rem] w-[25rem] will-change-transform"
                  >
                    <Link
                      to={`/services/${x.slug}`}
                      tabIndex={i === active ? 0 : -1}
                      aria-hidden={i !== active}
                      className="group relative block h-full overflow-hidden rounded-[2rem] bg-midnight shadow-[0_50px_90px_-40px_rgb(0_0_0/0.85)] ring-1 ring-white/15"
                    >
                      <Picture src={x.image} small={x.imageSmall} alt="" loading={i < 2 ? 'eager' : 'lazy'} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-110" />
                      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/45 via-45% to-midnight/10" />
                      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[2rem] border-metallic opacity-70" />
                      <div className="absolute inset-x-6 top-6 flex items-center justify-between">
                        <span className="rounded-full bg-midnight/55 px-3 py-1.5 label-tech text-white ring-1 ring-white/20 backdrop-blur-md">{x.index}</span>
                        <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-midnight transition duration-500 group-hover:rotate-45 group-hover:bg-emerald">
                          <ArrowUpRight className="size-4" aria-hidden />
                        </span>
                      </div>
                      <div className="absolute inset-x-7 bottom-7">
                        <span className="inline-flex size-14 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-electric to-royal text-white shadow-[0_18px_36px_-12px_rgb(8_126_219/0.9)]">
                          <XIcon className="size-6" aria-hidden />
                        </span>
                        <p className="mt-5 label-tech text-teal-300">{groupOf(x.slug)}</p>
                        <h4 className="mt-2 font-display text-[1.7rem] font-bold leading-tight text-white">{x.title}</h4>
                        <p className="mt-2 text-sm leading-relaxed text-white/75">{x.short}</p>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
            <span className="absolute bottom-0 right-0 label-tech text-steel-500">Scroll to deal the deck</span>
          </div>
        </Container>
      </div>
    </section>
  )
}

function DeckGrid() {
  return (
    <AnimatedSection id="service-lines" className="relative scroll-mt-32 overflow-hidden bg-deep py-24 md:py-32">
      <Texture variant="grid" />
      <Container className="relative">
        <SectionHeading index="01" eyebrow="Service lines" title={<>Nine disciplines. <em>One</em> point of accountability.</>} lead="Every service can be delivered on its own or combined into a single integrated scope." />
        <div className="mt-14 grid gap-6 [perspective:1600px] sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.slug} className="reveal">
              <ServiceCard3D service={s} />
            </div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  )
}

/* ----------------------------------------------------------------------------
 * Service groups: three tilting columns, one per group, listing their
 * services. Typographic and icon-led, so the deck above keeps the photos.
 * ------------------------------------------------------------------------- */

export function ServiceGroups() {
  return (
    <AnimatedSection id="groups" className="theme-light relative scroll-mt-32 overflow-hidden bg-paper py-24 md:py-32">
      <Texture variant="grid-light" />
      <Texture variant="glow-light" />
      <Container className="relative">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading tone="light" index="02" eyebrow="Three groups" title={<>Organised around how <em>assets</em> run.</>} />
          <p className="reveal max-w-md text-steel-700 lg:text-right">From production in the field, to building new plant, to keeping systems powered and supplied.</p>
        </div>
        <div className="mt-16 grid gap-7 lg:grid-cols-3">
          {SERVICE_GROUPS.map((g, gi) => {
            const items = servicesIn(g.slugs)
            return (
              <Tilt3D key={g.heading} max={6} lift={18} className="h-full rounded-[2rem]" wrapperClassName="reveal h-full">
                <article className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_40px_80px_-50px_rgb(9_38_75/0.6)] ring-1 ring-royal/10 transition-shadow duration-500 group-hover/tilt:shadow-[0_60px_100px_-50px_rgb(8_126_219/0.55)]">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald via-electric to-royal" />
                  <span aria-hidden className="absolute -right-3 -top-6 font-display text-[9rem] font-black leading-none text-royal/[0.05]">{pad(gi + 1)}</span>

                  <div className="relative h-20 [transform-style:preserve-3d]">
                    {items.map((s, i) => {
                      const I = s.icon
                      return (
                        <span
                          key={s.slug}
                          className="absolute top-0 inline-flex size-16 items-center justify-center rounded-2xl border border-white/40 text-white shadow-[0_18px_34px_-14px_rgb(8_126_219/0.8)] transition-transform duration-700 ease-[var(--ease-out-expo)]"
                          style={{
                            left: `${i * 2.6}rem`,
                            transform: `translateZ(${30 + i * 25}px)`,
                            background: ['linear-gradient(135deg,#00b99a,#0f8f7c)', 'linear-gradient(135deg,#087edb,#0b4c93)', 'linear-gradient(135deg,#0b4c93,#09264b)'][i],
                          }}
                        >
                          <I className="size-6" aria-hidden />
                        </span>
                      )
                    })}
                  </div>

                  <p className="relative mt-8 label-tech text-teal-500">Group {pad(gi + 1)}</p>
                  <h3 className="relative mt-2 font-display text-[1.75rem] font-bold leading-tight text-midnight">{g.heading}</h3>
                  <p className="relative mt-3 text-[0.9375rem] leading-relaxed text-steel-700">{g.note}</p>

                  <ul className="relative mt-8 space-y-2 [transform:translateZ(30px)]">
                    {items.map((s) => {
                      const I = s.icon
                      return (
                        <li key={s.slug}>
                          <Link to={`/services/${s.slug}`} className="group flex items-center gap-4 rounded-2xl p-3 ring-1 ring-transparent transition duration-300 hover:translate-x-1 hover:bg-paper hover:ring-royal/10">
                            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-royal/[0.06] text-royal transition group-hover:bg-gradient-to-br group-hover:from-electric group-hover:to-royal group-hover:text-white">
                              <I className="size-[1.1rem]" aria-hidden />
                            </span>
                            <span className="flex-1">
                              <span className="block label-tech text-steel-400">{s.index}</span>
                              <span className="block font-semibold leading-snug text-midnight">{s.title}</span>
                            </span>
                            <ArrowUpRight className="size-4 text-steel-400 transition group-hover:rotate-45 group-hover:text-teal-500" aria-hidden />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </article>
              </Tilt3D>
            )
          })}
        </div>
      </Container>
    </AnimatedSection>
  )
}

/* ----------------------------------------------------------------------------
 * Lifecycle: four phases around a central hub that stands for the single
 * point of accountability. The hub's rings turn slowly; each phase card tilts.
 * ------------------------------------------------------------------------- */

const LIFECYCLE = [
  { phase: 'Engineer', note: 'Plan and prepare the mechanical scope.', slugs: ['mechanical', 'steel-structures'] },
  { phase: 'Build', note: 'Construct plants, lines and systems.', slugs: ['industrial-construction', 'pipelines', 'electromechanical'] },
  { phase: 'Operate', note: 'Support production in the field.', slugs: ['field-services', 'wellsite-drilling'] },
  { phase: 'Sustain', note: 'Maintain, overhaul and resupply.', slugs: ['maintenance', 'equipment-supply'] },
]

function PhaseCard({ l, i }: { l: (typeof LIFECYCLE)[number]; i: number }) {
  return (
    <Tilt3D max={8} lift={16} className="h-full rounded-[1.75rem]" wrapperClassName="reveal h-full">
      <article className="relative h-full overflow-hidden rounded-[1.75rem] glass p-7 transition-colors duration-500 group-hover/tilt:bg-royal/30">
        <span aria-hidden className="absolute -right-2 -top-5 font-display text-[6.5rem] font-black leading-none text-metallic opacity-15">{pad(i + 1)}</span>
        <p className="relative label-tech text-emerald">Phase {pad(i + 1)}</p>
        <h3 className="relative mt-3 font-display text-3xl font-bold text-white [transform:translateZ(30px)]">{l.phase}</h3>
        <p className="relative mt-2 text-sm text-steel-400">{l.note}</p>
        <ul className="relative mt-5 space-y-0.5 [transform:translateZ(20px)]">
          {servicesIn(l.slugs).map((s) => (
            <li key={s.slug}>
              <Link to={`/services/${s.slug}`} className="group flex items-center justify-between gap-3 py-1.5 text-sm text-steel-200 transition hover:text-white">
                <span className="flex items-center gap-2"><span className="size-1 rotate-45 bg-emerald" aria-hidden /> {s.title}</span>
                <ArrowRight className="size-3.5 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </article>
    </Tilt3D>
  )
}

export function LifecycleHub() {
  return (
    <AnimatedSection id="lifecycle" className="relative scroll-mt-32 overflow-hidden bg-midnight py-24 md:py-32">
      <Texture variant="grid" />
      <Texture variant="glow" />
      <Container className="relative">
        <SectionHeading index="03" eyebrow="Integrated delivery" align="center" title={<>Where each service sits in the <em>lifecycle</em>.</>} lead="Combine services across phases and keep one team accountable from the first drawing to the last spare part." />

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_22rem_1fr] lg:gap-8">
          <div className="grid auto-rows-fr gap-6">
            <PhaseCard l={LIFECYCLE[0]!} i={0} />
            <PhaseCard l={LIFECYCLE[1]!} i={1} />
          </div>

          <div className="reveal relative mx-auto hidden size-[22rem] self-center lg:block [perspective:1000px]" aria-hidden>
            <div className="absolute inset-0 [transform:rotateX(58deg)] [transform-style:preserve-3d]">
              <div className="absolute inset-0 rounded-full border border-emerald/25" />
              <div className="absolute inset-6 animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-electric/40" />
              <div className="absolute inset-14 rounded-full border border-silver/15" />
              {[0, 90, 180, 270].map((deg, i) => (
                <span key={deg} className="absolute left-1/2 top-1/2 -ml-2 -mt-2 size-4 rounded-full bg-emerald shadow-[0_0_18px_4px_rgb(0_185_154/0.6)]" style={{ transform: `rotate(${deg}deg) translateY(-11rem)`, opacity: 0.6 + i * 0.1 }} />
              ))}
            </div>
            <div className="absolute left-1/2 top-1/2 flex size-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-metallic surface-metal text-center shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8),0_0_80px_-10px_rgb(8_126_219/0.5)] animate-[float_7s_ease-in-out_infinite]">
              <span className="label-tech text-emerald">One team</span>
              <span className="mt-2 px-6 font-display text-lg font-bold leading-tight text-white">Single point of accountability</span>
            </div>
          </div>

          <div className="grid auto-rows-fr gap-6">
            <PhaseCard l={LIFECYCLE[2]!} i={2} />
            <PhaseCard l={LIFECYCLE[3]!} i={3} />
          </div>
        </div>
      </Container>
    </AnimatedSection>
  )
}

/* ----------------------------------------------------------------------------
 * Photo-free 3D link tiles, used wherever a page must keep its photographs
 * to itself (service detail pages, industry pages, related lists).
 * ------------------------------------------------------------------------- */

type Tone = 'dark' | 'light'

export function ServiceTile({ service: s, tone = 'dark', className }: { service: Service; tone?: Tone; className?: string }) {
  const light = tone === 'light'
  const Icon = s.icon
  return (
    <Tilt3D max={9} lift={18} className="h-full rounded-[1.75rem]" wrapperClassName={cn('h-full', className)}>
      <Link
        to={`/services/${s.slug}`}
        className={cn(
          'group relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-[1.75rem] p-7 ring-1 transition duration-500',
          light
            ? 'bg-white ring-royal/10 shadow-[0_30px_60px_-44px_rgb(9_38_75/0.6)] group-hover/tilt:shadow-[0_50px_80px_-40px_rgb(8_126_219/0.5)]'
            : 'bg-[linear-gradient(160deg,rgb(11_76_147/0.55),rgb(6_23_47/0.9))] ring-silver/10 group-hover/tilt:ring-emerald/40',
        )}
      >
        <span aria-hidden className={cn('absolute -right-3 -top-7 font-display text-[8.5rem] font-black leading-none transition-transform duration-700 group-hover:-translate-x-2', light ? 'text-royal/[0.06]' : 'text-white/[0.05]')}>{s.index}</span>
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-emerald via-electric to-royal transition-transform duration-700 group-hover:scale-x-100" />
        <div className="relative flex items-start justify-between">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-royal text-white shadow-[0_18px_36px_-12px_rgb(8_126_219/0.85)] transition-transform duration-700 ease-[var(--ease-out-expo)] [transform:translateZ(60px)] group-hover:[transform:translateZ(90px)_rotate(-8deg)]">
            <Icon className="size-6" aria-hidden />
          </span>
          <span className={cn('inline-flex size-10 items-center justify-center rounded-full ring-1 transition duration-500 group-hover:rotate-45 group-hover:bg-emerald group-hover:text-midnight group-hover:ring-emerald', light ? 'text-royal ring-royal/15' : 'text-white ring-white/20')}>
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
        <div className="relative mt-auto pt-10 [transform:translateZ(36px)]">
          <p className={cn('label-tech', light ? 'text-teal-500' : 'text-emerald')}>Service {s.index}</p>
          <h3 className={cn('mt-2 font-display text-[1.45rem] font-bold leading-tight', light ? 'text-midnight' : 'text-white')}>{s.title}</h3>
          <p className={cn('mt-2 text-sm leading-relaxed', light ? 'text-steel-700' : 'text-steel-400')}>{s.short}</p>
        </div>
      </Link>
    </Tilt3D>
  )
}

export function IndustryTile({ industry: ind, tone = 'dark', className }: { industry: Industry; tone?: Tone; className?: string }) {
  const light = tone === 'light'
  const Icon = ind.icon
  return (
    <Tilt3D max={9} lift={18} className="h-full rounded-[1.75rem]" wrapperClassName={cn('h-full', className)}>
      <Link
        to={`/industries/${ind.slug}`}
        className={cn(
          'group relative flex h-full min-h-[20rem] flex-col overflow-hidden rounded-[1.75rem] p-7 ring-1 transition duration-500',
          light ? 'bg-white ring-royal/10 shadow-[0_30px_60px_-44px_rgb(9_38_75/0.6)]' : 'glass ring-silver/10 group-hover/tilt:ring-emerald/40',
        )}
      >
        <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br from-emerald/25 to-electric/10 blur-2xl transition-transform duration-700 group-hover:scale-125" />
        <Icon aria-hidden className={cn('absolute -bottom-6 -right-6 size-40 transition-transform duration-700 group-hover:-rotate-6 group-hover:scale-110', light ? 'text-royal/[0.05]' : 'text-white/[0.04]')} />
        <span className="relative inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_18px_36px_-12px_rgb(0_185_154/0.8)] [transform:translateZ(60px)]">
          <Icon className="size-6" aria-hidden />
        </span>
        <div className="relative mt-auto pt-10 [transform:translateZ(36px)]">
          <p className={cn('label-tech', light ? 'text-teal-500' : 'text-emerald')}>Industry {ind.index}</p>
          <h3 className={cn('mt-2 font-display text-[1.45rem] font-bold leading-tight', light ? 'text-midnight' : 'text-white')}>{ind.title}</h3>
          <p className={cn('mt-2 text-sm leading-relaxed', light ? 'text-steel-700' : 'text-steel-400')}>{ind.short}</p>
          <span className={cn('mt-5 inline-flex items-center gap-2 text-sm font-semibold', light ? 'text-royal' : 'text-white')}>
            <span className="h-px w-6 bg-emerald transition-all duration-500 group-hover:w-12" /> View sector
          </span>
        </div>
      </Link>
    </Tilt3D>
  )
}
