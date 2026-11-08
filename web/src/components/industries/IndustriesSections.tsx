import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight, Compass, HardHat, Layers, RotateCw, ScrollText } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Container } from '@/components/Container'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { SectionHeading } from '@/components/SectionHeading'
import { Texture } from '@/components/Texture'
import { Picture } from '@/components/Picture'
import { buttonStyles } from '@/lib/buttonStyles'
import { cn } from '@/lib/cn'
import { scrollToElement } from '@/lib/lenis'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { INDUSTRIES, type Industry } from '@/data/industries'
import { SERVICES, servicesForIndustry } from '@/data/services'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const pad = (n: number) => String(n).padStart(2, '0')

/* ----------------------------------------------------------------------------
 * Sector panorama: the four sectors as full-screen panels on a horizontal
 * track that travels sideways as you scroll down. Each photo turns on a
 * curved wall as it moves through the frame, and the copy fades with it.
 * Phones, tablets and reduced motion get the panels stacked vertically.
 * ------------------------------------------------------------------------- */

export function SectorPanorama() {
  const reduced = usePrefersReducedMotion()
  const desktop = useMediaQuery('(min-width: 1024px)')
  return desktop && !reduced ? <PanoramaScroller /> : <PanoramaStack />
}

function SectorCopy({ ind, compact = false }: { ind: Industry; compact?: boolean }) {
  const Icon = ind.icon
  const services = servicesForIndustry(ind.slug)
  return (
    <div>
      <p className="flex items-center gap-3 label-tech">
        <span className="text-emerald">Industry {ind.index}</span>
        <span className="h-px w-10 bg-gradient-to-r from-emerald to-transparent" aria-hidden />
        <span className="text-steel-500">of {pad(INDUSTRIES.length)}</span>
      </p>
      <h3 className={cn('mt-5 flex items-center gap-4 font-display font-bold leading-[1.02] text-white', compact ? 'text-3xl' : 'text-[clamp(2.2rem,3.6vw,3.6rem)]')}>
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_18px_40px_-12px_rgb(0_185_154/0.8)]">
          <Icon className="size-6" aria-hidden />
        </span>
        {ind.title}
      </h3>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-steel-300">{ind.description}</p>
      <ul className="mt-6 space-y-2">
        {ind.context.map((c, i) => (
          <li key={c} className="flex items-center gap-3 text-sm text-steel-200">
            <span className="font-mono text-xs text-emerald">{pad(i + 1)}</span>
            <span className="h-px w-5 bg-silver/25" aria-hidden />
            {c}
          </li>
        ))}
      </ul>
      <div className="mt-7 flex items-center gap-3">
        <div className="flex -space-x-2">
          {services.slice(0, 5).map((s) => {
            const SI = s.icon
            return (
              <span key={s.slug} title={s.title} className="inline-flex size-9 items-center justify-center rounded-full border-2 border-midnight bg-gradient-to-br from-electric to-royal text-white">
                <SI className="size-4" aria-hidden />
              </span>
            )
          })}
        </div>
        <span className="text-sm text-steel-400">
          <span className="font-semibold text-white">{services.length}</span> services support this sector
        </span>
      </div>
      <Link to={`/industries/${ind.slug}`} className={buttonStyles({ variant: 'primary', size: 'md', className: 'mt-8' })}>
        Explore the sector <ArrowUpRight className="size-4" aria-hidden />
      </Link>
    </div>
  )
}

function PanoramaScroller() {
  const ref = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const frameRefs = useRef<(HTMLDivElement | null)[]>([])
  const copyRefs = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)
  const N = INDUSTRIES.length

  useGSAP(
    () => {
      const paint = (pos: number) => {
        if (trackRef.current) trackRef.current.style.transform = `translate3d(${(-pos * 100).toFixed(3)}vw,0,0)`
        frameRefs.current.forEach((el, i) => {
          if (!el) return
          const d = i - pos
          el.style.transform = `translateX(${(d * -14).toFixed(2)}%) rotateY(${(d * -28).toFixed(2)}deg) scale(${(1 - Math.min(1, Math.abs(d)) * 0.12).toFixed(3)})`
        })
        copyRefs.current.forEach((el, i) => {
          if (!el) return
          const d = Math.abs(i - pos)
          el.style.opacity = Math.max(0, 1 - d * 1.6).toFixed(3)
          el.style.transform = `translateX(${((i - pos) * 18).toFixed(1)}%)`
        })
      }
      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        onUpdate: (self) => {
          const pos = self.progress * (N - 1)
          paint(pos)
          const a = Math.round(pos)
          setActive((prev) => (prev === a ? prev : a))
        },
      })
      paint(0)
      return () => st.kill()
    },
    { scope: ref },
  )

  const goTo = (i: number) => {
    const el = ref.current
    if (!el) return
    scrollToElement(el, ((el.offsetHeight - window.innerHeight) * i) / (N - 1))
  }

  return (
    <section ref={ref} id="sectors" className="relative scroll-mt-0 bg-midnight" style={{ height: `${N * 85 + 100}svh` }} aria-label="Sectors">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Texture variant="grid" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_70%_55%,rgb(8_126_219/0.2),transparent_70%)]" />

        <Container className="pointer-events-none absolute inset-x-0 top-28 z-10 flex items-end justify-between">
          <SectionHeading reveal={false} size="md" index="01" eyebrow="Sectors" title={<>Four sectors. <em>One</em> standard.</>} className="pointer-events-auto" />
        </Container>

        <div ref={trackRef} className="absolute inset-y-0 left-0 flex will-change-transform" style={{ width: `${N * 100}vw` }}>
          {INDUSTRIES.map((ind, i) => (
            <div key={ind.slug} className="relative flex h-full w-screen items-center pt-40">
              <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-4 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
                <div
                  ref={(el) => {
                    copyRefs.current[i] = el
                  }}
                >
                  <SectorCopy ind={ind} />
                </div>
                <div className="relative [perspective:1600px]">
                  <span aria-hidden className="pointer-events-none absolute -right-4 -top-20 select-none font-display text-[13rem] font-black leading-none text-white/[0.04]">{ind.index}</span>
                  <div
                    ref={(el) => {
                      frameRefs.current[i] = el
                    }}
                    className="relative will-change-transform [transform-style:preserve-3d]"
                  >
                    <div aria-hidden className="absolute -inset-5 rounded-[2.5rem] border border-emerald/15 [transform:translateZ(-50px)]" />
                    <Link to={`/industries/${ind.slug}`} tabIndex={-1} aria-hidden className="group relative block aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[0_60px_120px_-50px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
                      <Picture src={ind.image} small={ind.imageSmall} alt="" loading={i === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                      <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-midnight/60 via-transparent to-white/10" />
                    </Link>
                    <div className="absolute -bottom-6 -left-6 rounded-2xl border border-white/15 bg-midnight/75 px-5 py-4 shadow-[0_30px_60px_-24px_rgb(0_0_0/0.9)] backdrop-blur-xl [transform:translateZ(70px)]">
                      <p className="label-tech text-emerald">Sector {ind.index}</p>
                      <p className="mt-1 max-w-[16rem] text-sm text-white">{ind.short}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <Container className="absolute inset-x-0 bottom-8 z-10">
          <ol className="grid grid-cols-4 gap-3" aria-label="Sectors">
            {INDUSTRIES.map((ind, i) => (
              <li key={ind.slug}>
                <button type="button" onClick={() => goTo(i)} aria-current={i === active ? 'step' : undefined} className="group w-full text-left">
                  <span className="block h-0.5 overflow-hidden rounded-full bg-silver/15">
                    <span className={cn('block h-full origin-left bg-gradient-to-r from-emerald to-electric transition-transform duration-700', i <= active ? 'scale-x-100' : 'scale-x-0')} />
                  </span>
                  <span className={cn('mt-3 flex items-center gap-2 text-xs transition-colors', i === active ? 'text-white' : 'text-steel-500 group-hover:text-steel-300')}>
                    <span className="font-mono">{ind.index}</span> {ind.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </Container>
      </div>
    </section>
  )
}

function PanoramaStack() {
  return (
    <AnimatedSection id="sectors" className="relative scroll-mt-24 overflow-hidden bg-midnight py-24 md:py-32">
      <Texture variant="grid" />
      <Container className="relative">
        <SectionHeading index="01" eyebrow="Sectors" title={<>Four sectors. <em>One</em> standard.</>} />
        <div className="mt-14 space-y-16">
          {INDUSTRIES.map((ind, i) => (
            <article key={ind.slug} className="reveal grid gap-8 md:grid-cols-2 md:items-center">
              <Link to={`/industries/${ind.slug}`} className={cn('relative block aspect-[4/3] overflow-hidden rounded-[1.75rem] ring-1 ring-white/15', i % 2 === 1 && 'md:order-2')} tabIndex={-1} aria-hidden>
                <Picture src={ind.image} small={ind.imageSmall} alt="" loading="lazy" className="h-full w-full object-cover" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-midnight/60 to-transparent" />
              </Link>
              <SectorCopy ind={ind} compact />
            </article>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  )
}

/* ----------------------------------------------------------------------------
 * Connections: pick a sector to light up the services that support it, or
 * hover a service to see which sectors it serves.
 * ------------------------------------------------------------------------- */

export function SectorConnections() {
  const [sector, setSector] = useState<string>(INDUSTRIES[0]!.slug)
  const [hoverService, setHoverService] = useState<string | null>(null)
  const hovered = SERVICES.find((s) => s.slug === hoverService)

  return (
    <AnimatedSection id="connections" className="theme-light relative scroll-mt-32 overflow-hidden bg-paper py-24 md:py-32">
      <Texture variant="grid-light" />
      <Texture variant="glow-light" />
      <Container className="relative">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading tone="light" index="02" eyebrow="Services by sector" title={<>See how the services <em>connect</em>.</>} />
          <p className="reveal max-w-md text-steel-700 lg:text-right">Choose a sector to light up the services that support it<span className="[@media(hover:none)]:hidden">, or hover a service to see where it applies</span>.</p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="reveal grid gap-3 self-start" role="tablist" aria-label="Sectors">
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon
              const on = sector === ind.slug
              const lit = hovered ? hovered.industries.includes(ind.slug) : false
              const count = servicesForIndustry(ind.slug).length
              return (
                <button
                  key={ind.slug}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setSector(ind.slug)}
                  onMouseEnter={() => setSector(ind.slug)}
                  className={cn(
                    'group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 text-left ring-1 transition duration-500',
                    on ? 'bg-midnight text-white shadow-[0_30px_60px_-30px_rgb(9_38_75/0.8)] ring-midnight' : 'bg-white text-midnight ring-royal/10 hover:-translate-y-0.5 hover:ring-royal/25',
                    lit && !on && 'ring-2 ring-emerald',
                  )}
                >
                  <span className={cn('inline-flex size-12 shrink-0 items-center justify-center rounded-xl transition duration-500', on ? 'bg-gradient-to-br from-emerald to-teal-500 text-midnight' : 'bg-royal/[0.06] text-royal')}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="flex-1">
                    <span className={cn('block label-tech', on ? 'text-emerald' : 'text-steel-400')}>Industry {ind.index}</span>
                    <span className="mt-0.5 block font-display text-lg font-bold leading-tight">{ind.title}</span>
                  </span>
                  <span className={cn('font-display text-3xl font-black', on ? 'text-white' : 'text-royal/15')}>{count}</span>
                  {on && <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald to-electric" />}
                </button>
              )
            })}
          </div>

          <div className="reveal grid gap-3 [perspective:1400px] sm:grid-cols-2 xl:grid-cols-3" role="tabpanel">
            {SERVICES.map((s) => {
              const on = s.industries.includes(sector)
              const SI = s.icon
              return (
                <Link
                  key={s.slug}
                  to={`/services/${s.slug}`}
                  onMouseEnter={() => setHoverService(s.slug)}
                  onMouseLeave={() => setHoverService(null)}
                  onFocus={() => setHoverService(s.slug)}
                  onBlur={() => setHoverService(null)}
                  className={cn(
                    'group relative flex flex-col rounded-2xl p-4 ring-1 transition-all duration-500 ease-[var(--ease-out-expo)]',
                    on
                      ? 'bg-white shadow-[0_24px_50px_-30px_rgb(8_126_219/0.6)] ring-emerald/50 [transform:translateZ(20px)]'
                      : 'bg-white/50 opacity-45 ring-royal/10 grayscale hover:opacity-90 hover:grayscale-0',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className={cn('inline-flex size-10 items-center justify-center rounded-xl transition duration-500', on ? 'bg-gradient-to-br from-electric to-royal text-white' : 'bg-royal/[0.06] text-royal')}>
                      <SI className="size-[1.1rem]" aria-hidden />
                    </span>
                    <span className="flex gap-1" aria-label={`Supports ${s.industries.length} of ${INDUSTRIES.length} sectors`}>
                      {INDUSTRIES.map((ind) => (
                        <span key={ind.slug} className={cn('size-1.5 rounded-full', s.industries.includes(ind.slug) ? (ind.slug === sector ? 'bg-emerald' : 'bg-royal/50') : 'bg-royal/10')} />
                      ))}
                    </span>
                  </div>
                  <span className="mt-4 label-tech text-steel-400">{s.index}</span>
                  <span className="mt-1 font-semibold leading-snug text-midnight">{s.title}</span>
                  <ArrowUpRight className="absolute bottom-4 right-4 size-4 text-steel-400 opacity-0 transition group-hover:opacity-100" aria-hidden />
                </Link>
              )
            })}
          </div>
        </div>
      </Container>
    </AnimatedSection>
  )
}

/* ----------------------------------------------------------------------------
 * Standards: four cards that flip in 3D on hover (or tap) to show detail.
 * ------------------------------------------------------------------------- */

const STANDARDS = [
  { icon: HardHat, title: 'Safety first', front: 'The same safety discipline applies whichever sector we work in.', back: 'Every job is risk-assessed before mobilisation, permit-to-work is respected and everyone on site carries stop-work authority.' },
  { icon: Compass, title: 'Sector awareness', front: 'Teams briefed on the hazards and constraints of each environment.', back: 'Offshore logistics, live process plant, construction sites and equipment halls each bring their own risks. Crews are briefed on them before work starts.' },
  { icon: ScrollText, title: 'Operator procedures', front: 'Work delivered under the client’s systems and procedures.', back: 'We plan with the operator’s people, work to their permits and procedures, and share information openly against a single schedule.' },
  { icon: Layers, title: 'Integrated scope', front: 'Services combined so fewer handovers stand in the way.', back: 'Field services, construction, maintenance and supply can sit under one point of accountability, from the first drawing to handover.' },
]

export function StandardsFlip() {
  const [flipped, setFlipped] = useState<number | null>(null)
  return (
    <AnimatedSection id="standards" className="relative scroll-mt-32 overflow-hidden bg-deep py-24 md:py-32">
      <Texture variant="grid" />
      <div aria-hidden className="absolute -left-40 top-10 size-[34rem] rounded-full bg-emerald/10 blur-3xl" />
      <Container className="relative">
        <SectionHeading index="03" eyebrow="Across every sector" align="center" title={<>The same standard, <em>wherever</em> we work.</>} lead="Hover or tap a card to turn it over." />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STANDARDS.map((s, i) => {
            const Icon = s.icon
            const on = flipped === i
            return (
              <div key={s.title} className="reveal h-[22rem] [perspective:1400px]">
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`${s.title}: ${s.back}`}
                  onClick={() => setFlipped(on ? null : i)}
                  onMouseEnter={() => setFlipped(i)}
                  onMouseLeave={() => setFlipped(null)}
                  className="group relative block h-full w-full text-left transition-transform duration-[900ms] ease-[var(--ease-out-expo)] [transform-style:preserve-3d]"
                  style={{ transform: on ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                  {/* Front */}
                  <span className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] bg-[linear-gradient(165deg,rgb(11_76_147/0.5),rgb(6_23_47/0.9))] p-7 ring-1 ring-silver/10 [backface-visibility:hidden]">
                    <span aria-hidden className="absolute -right-2 -top-6 font-display text-[7rem] font-black leading-none text-white/[0.05]">{pad(i + 1)}</span>
                    <span className="relative inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_18px_36px_-12px_rgb(0_185_154/0.8)]">
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <span className="relative mt-auto font-display text-2xl font-bold text-white">{s.title}</span>
                    <span className="relative mt-3 text-sm leading-relaxed text-steel-400">{s.front}</span>
                    <span className="relative mt-5 flex items-center gap-2 label-tech text-steel-500">
                      <RotateCw className="size-3.5" aria-hidden /> Turn over
                    </span>
                  </span>
                  {/* Back */}
                  <span className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] border-metallic surface-metal p-7 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <Texture variant="lines" className="opacity-40" />
                    <span className="relative label-tech text-emerald">Standard {pad(i + 1)}</span>
                    <span className="relative mt-3 font-display text-2xl font-bold text-white">{s.title}</span>
                    <span className="relative mt-4 leading-relaxed text-steel-200">{s.back}</span>
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald via-electric to-royal" />
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      </Container>
    </AnimatedSection>
  )
}

/** Image band for sectors that are not listed, with a slow parallax on the photo. */
export function NotListedBand() {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  useGSAP(
    () => {
      if (reduced) return
      gsap.fromTo('[data-band-img]', { yPercent: -10, scale: 1.15 }, { yPercent: 10, scale: 1.15, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    },
    { scope: ref, dependencies: [reduced] },
  )
  return (
    <section ref={ref} className="relative isolate overflow-hidden py-28 md:py-36" aria-label="Other sectors">
      <Picture data-band-img src="/assets/images/stock/steel-lattice-structure.jpg" small="/assets/images/stock/steel-lattice-structure-sm.jpg" alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-midnight via-midnight/80 to-midnight/30" />
      <Container className="relative">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 label-tech text-emerald">
            <span className="h-px w-8 bg-emerald" aria-hidden /> Other sectors
          </p>
          <h2 className="mt-5 text-display-lg font-bold text-white">
            Operating in a sector <em>not listed</em> here?
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-steel-200">Our engineering and construction capabilities transfer well. Tell us about your facility and requirements.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" className={buttonStyles({ variant: 'emerald', size: 'lg' })}>
              Get in touch <ArrowUpRight className="size-4" aria-hidden />
            </Link>
            <Link to="/services" className={buttonStyles({ variant: 'ghost', size: 'lg' })}>
              Our services <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
