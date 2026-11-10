import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowDown, ArrowUpRight, Check, Layers, MapPinned, ShieldCheck, Target } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Container } from '@/components/Container'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Picture } from '@/components/Picture'
import { Texture } from '@/components/Texture'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { buttonStyles } from '@/lib/buttonStyles'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { Industry } from '@/data/industries'
import { SERVICES, SERVICE_GROUPS, type Service } from '@/data/services'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const pad = (n: number) => String(n).padStart(2, '0')
const SLATS = 6

/**
 * Industry hero. The sector's inner photograph fills the right half of the
 * screen, edge to edge, cut into vertical louvre slats that swing into place
 * on load, shift at different depths with the pointer and open like blinds
 * as the page scrolls. Key facts sit on a glass bar along the bottom; each
 * figure is a count of this site's own content, not a company statistic.
 */
export function IndustryHero({ industry: ind, total, services }: { industry: Industry; total: number; services: Service[] }) {
  const ref = useRef<HTMLElement>(null)
  const slatRefs = useRef<(HTMLDivElement | null)[]>([])
  const reduced = usePrefersReducedMotion()
  const Icon = ind.icon

  const facts = [
    { icon: Target, value: pad(ind.focus.length), label: 'Focus areas' },
    { icon: Layers, value: pad(services.length), label: 'Supporting services' },
    { icon: MapPinned, value: pad(ind.context.length), label: 'Operating environments' },
    { icon: ShieldCheck, value: '01', label: 'Point of accountability' },
  ]

  useGSAP(
    () => {
      if (reduced) return
      gsap.from(slatRefs.current, { rotateY: -88, opacity: 0.01, duration: 1.6, ease: 'expo.out', stagger: 0.08, delay: 0.1 })
      // Hero entrances start at 1% opacity, not 0: identical to the eye, but the
      // browser counts them as painted on the first frame (Largest Contentful Paint).
      gsap.from('[data-hero-in]', { y: 44, opacity: 0.01, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.15 })
      gsap.from('[data-hero-fact]', { y: 30, opacity: 0.01, duration: 1, ease: 'expo.out', stagger: 0.07, delay: 0.7 })
      gsap.fromTo(slatRefs.current, { rotateY: 0 }, { rotateY: 34, ease: 'none', stagger: 0.02, immediateRender: false, scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('[data-hero-copy]', { y: -70, opacity: 0, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: '70% top', scrub: true } })
    },
    { scope: ref, dependencies: [ind.slug, reduced] },
  )

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    slatRefs.current.forEach((el, i) => {
      if (!el) return
      const k = (i - (SLATS - 1) / 2) / SLATS
      el.style.translate = `0 ${(y * 12 * (1 + Math.abs(k))).toFixed(1)}px ${(x * 70 * k).toFixed(1)}px`
    })
  }

  const slats = (
    <div className="absolute inset-0 [perspective:1800px]">
      {Array.from({ length: SLATS }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            slatRefs.current[i] = el
          }}
          className="absolute inset-y-0 overflow-hidden transition-[translate] duration-700 ease-out will-change-transform"
          style={{ left: `calc(${(i * 100) / SLATS}% + 2px)`, width: `calc(${100 / SLATS}% - 4px)` }}
        >
          <div className="absolute inset-y-0" style={{ width: `calc(${SLATS * 100}% + ${SLATS * 4}px)`, left: `calc(${-i * 100}% - ${i * 4 + 2}px)` }}>
            <Picture src={ind.innerImage} small={ind.innerImageSmall} alt={i === 0 ? `${ind.title}: GULF NEXT sector photograph` : ''} loading="eager" fetchPriority={i === 0 ? 'high' : undefined} className="h-full w-full object-cover" />
          </div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-white/[0.08]" />
        </div>
      ))}
    </div>
  )

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-midnight"
      aria-label={ind.title}
      onPointerMove={onMove}
      onPointerLeave={() => slatRefs.current.forEach((el) => el && (el.style.translate = ''))}
    >
      <Texture variant="grid" className="-z-10 opacity-50" />
      <div aria-hidden className="absolute -left-48 top-1/3 -z-10 size-[36rem] rounded-full bg-electric/15 blur-3xl" />

      <Container className="relative">
        <div data-hero-copy className="flex min-h-[92svh] flex-col justify-center pb-44 pt-36 lg:w-[50%] lg:pb-48">
          <div data-hero-in>
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Industries', href: '/industries' }, { label: ind.title }]} />
          </div>
          <p data-hero-in className="mt-8 flex items-center gap-4">
            <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_18px_40px_-12px_rgb(0_185_154/0.8)]">
              <Icon className="size-6" aria-hidden />
            </span>
            <span className="flex flex-col">
              <span className="label-tech text-emerald">Industry {ind.index}</span>
              <span className="mt-1 text-sm text-steel-400">{ind.short}</span>
            </span>
          </p>
          <h1 data-hero-in className="mt-7 font-bold leading-[1.02] tracking-[-0.03em] text-white [text-wrap:balance]" style={{ fontSize: 'clamp(2.5rem, 4.4vw, 4.4rem)' }}>
            {ind.title}
          </h1>
          <p data-hero-in className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{ind.description}</p>
          <ul data-hero-in className="mt-7 flex flex-wrap gap-2">
            {ind.context.map((c) => (
              <li key={c} className="rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-white/85 backdrop-blur-md">
                {c}
              </li>
            ))}
          </ul>
          <div data-hero-in className="mt-9 flex flex-wrap gap-3">
            <Link to="/contact" className={buttonStyles({ variant: 'emerald', size: 'lg' })}>
              Discuss a project <ArrowUpRight className="size-4" aria-hidden />
            </Link>
            <a href="#services" className={buttonStyles({ variant: 'ghost', size: 'lg' })}>
              Supporting services <ArrowDown className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </Container>

      {/* Photograph: right half, full height and edge to edge on desktop; a band under the copy on smaller screens */}
      <div className="relative -mt-36 h-[52svh] lg:absolute lg:inset-y-0 lg:right-0 lg:-z-[1] lg:mt-0 lg:h-auto lg:w-[54%]">
        {slats}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-midnight via-midnight/40 via-25% to-transparent lg:block" />
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-midnight via-transparent via-40% to-midnight/50 lg:block" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-midnight via-transparent to-midnight lg:hidden" />
        <span className="absolute right-8 top-32 hidden rounded-full bg-white px-4 py-2 label-tech text-midnight shadow-[0_20px_40px_-20px_rgb(0_0_0/0.9)] lg:block">
          Sector {ind.index} / {pad(total)}
        </span>
      </div>

      {/* Key facts */}
      <div className="relative z-10 -mt-24 pb-8 lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0">
        <Container>
          <ul className="grid grid-cols-2 overflow-hidden rounded-[1.5rem] border border-white/12 bg-midnight/70 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)] backdrop-blur-xl lg:grid-cols-4">
            {facts.map((f, i) => (
              <li
                key={f.label}
                data-hero-fact
                className={cn('group flex min-w-0 items-center gap-4 px-5 py-5 transition-colors duration-500 hover:bg-white/[0.04] md:px-7', i % 2 === 1 && 'border-l border-white/10', i > 1 && 'border-t border-white/10 lg:border-t-0', i === 2 && 'lg:border-l')}
              >
                <span className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-emerald ring-1 ring-white/10 transition duration-500 group-hover:bg-emerald group-hover:text-midnight sm:inline-flex">
                  <f.icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-display text-3xl font-black leading-none text-white">{f.value}</span>
                  <span className="mt-1.5 block label-tech text-steel-400">{f.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </section>
  )
}

/**
 * Focus areas as expanding photo panels: the active panel opens wide with its
 * detail, the others fold into narrow columns with vertical titles.
 * Each panel uses one of the sector's own "in the field" photographs.
 */
export function FocusPanels({ industry: ind }: { industry: Industry }) {
  const [active, setActive] = useState(0)
  const items = ind.focus.map((f, i) => ({ ...f, photo: ind.gallery[i % ind.gallery.length]! }))

  return (
    <>
      {/* Desktop: expanding panels */}
      <div className="reveal mt-14 hidden h-[34rem] gap-3 lg:flex">
        {items.map((it, i) => {
          const on = i === active
          return (
            <button
              key={it.title}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-expanded={on}
              className={cn(
                'group relative overflow-hidden rounded-[1.75rem] text-left ring-1 ring-white/10 transition-[flex-grow,box-shadow] duration-[900ms] ease-[var(--ease-out-expo)]',
                on ? 'flex-[3.4] shadow-[0_50px_100px_-50px_rgb(0_0_0/0.9)]' : 'flex-1',
              )}
            >
              <Picture src={it.photo.src} small={it.photo.small} alt={it.photo.alt} loading="lazy" className={cn('absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-[1200ms] ease-[var(--ease-out-expo)]', on ? 'scale-100' : 'scale-125 brightness-75 saturate-50')} />
              <div aria-hidden className={cn('absolute inset-0 transition-opacity duration-700', on ? 'bg-gradient-to-t from-midnight via-midnight/40 to-transparent' : 'bg-midnight/55')} />
              <span className="absolute left-6 top-6 font-mono text-sm text-emerald">{pad(i + 1)}</span>

              {/* Collapsed: vertical title */}
              <span className={cn('absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-lg font-semibold text-white transition-opacity duration-500 [writing-mode:vertical-rl] rotate-180', on ? 'opacity-0' : 'opacity-100')}>{it.title}</span>

              {/* Expanded: detail */}
              <span className={cn('absolute inset-x-8 bottom-8 block transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]', on ? 'translate-y-0 opacity-100 delay-200' : 'pointer-events-none translate-y-6 opacity-0')}>
                <span className="label-tech text-emerald">Focus area {pad(i + 1)}</span>
                <span className="mt-3 block font-display text-3xl font-bold text-white">{it.title}</span>
                <span className="mt-3 block max-w-md leading-relaxed text-white/80">{it.desc}</span>
                <span className="mt-5 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/20 backdrop-blur-md">{it.photo.alt}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Phones and tablets: cards */}
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:hidden">
        {items.map((it, i) => (
          <article key={it.title} className="reveal overflow-hidden rounded-[1.5rem] bg-midnight ring-1 ring-white/10">
            <Picture src={it.photo.src} small={it.photo.small} alt={it.photo.alt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
            <div className="p-6">
              <span className="label-tech text-emerald">Focus area {pad(i + 1)}</span>
              <h3 className="mt-2 font-display text-xl font-bold text-white">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-400">{it.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

/** Ring of nine segments, one per service line; lit segments support the sector. */
function CoverageRing({ lit, total }: { lit: number; total: number }) {
  const r = 52
  const C = 2 * Math.PI * r
  const seg = C / total
  const gap = 6
  return (
    <div className="relative size-36 shrink-0">
      <svg viewBox="0 0 128 128" className="size-full -rotate-90">
        <defs>
          <linearGradient id="cov-grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#00b99a" />
            <stop offset="1" stopColor="#087edb" />
          </linearGradient>
        </defs>
        {Array.from({ length: total }, (_, i) => (
          <circle
            key={i}
            cx="64"
            cy="64"
            r={r}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            stroke={i < lit ? 'url(#cov-grad)' : 'rgb(9 38 75 / 0.1)'}
            strokeDasharray={`${seg - gap} ${C - seg + gap}`}
            strokeDashoffset={-i * seg}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-black leading-none text-midnight">{pad(lit)}</span>
        <span className="mt-1 label-tech text-steel-500">of {pad(total)}</span>
      </div>
    </div>
  )
}

/**
 * Relevant services, organised by service group. Every group shows all of
 * its services: the ones that support this sector are interactive 3D tiles,
 * the rest are shown muted as not typical (from the same data as the
 * Industries page map). A ring summarises the sector's coverage.
 */
export function SectorServices({ industry: ind }: { industry: Industry }) {
  const total = SERVICES.length
  const supported = SERVICES.filter((s) => s.industries.includes(ind.slug))

  return (
    <>
      <div className="reveal mt-12 flex flex-col gap-6 rounded-[2rem] bg-paper p-6 ring-1 ring-royal/10 sm:flex-row sm:items-center md:p-8">
        <CoverageRing lit={supported.length} total={total} />
        <div className="flex-1">
          <p className="label-tech text-teal-600">Service coverage</p>
          <p className="mt-2 font-display text-2xl font-bold leading-snug text-midnight md:text-[1.75rem]">
            {supported.length} of our {total} service lines support {ind.title.toLowerCase()}.
          </p>
          <p className="mt-2 max-w-2xl text-steel-700">Each can be delivered on its own, or combined into one integrated scope with a single point of accountability.</p>
        </div>
        <Link to="/services" className={buttonStyles({ variant: 'dark', size: 'md', className: 'shrink-0 self-start sm:self-center' })}>
          All services <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {SERVICE_GROUPS.map((g, gi) => {
          const items = SERVICES.filter((s) => g.slugs.includes(s.slug))
          const on = items.filter((s) => s.industries.includes(ind.slug)).length
          return (
            <Tilt3D key={g.heading} max={5} lift={14} className="h-full rounded-[2rem]" wrapperClassName="reveal h-full">
              <article className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_40px_80px_-56px_rgb(9_38_75/0.7)] ring-1 ring-royal/10 md:p-7">
                <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald via-electric to-royal" />
                <header className="flex items-start justify-between gap-4 [transform:translateZ(24px)]">
                  <div>
                    <p className="label-tech text-teal-600">Group {pad(gi + 1)}</p>
                    <h3 className="mt-1.5 font-display text-xl font-bold leading-tight text-midnight">{g.heading}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-black leading-none text-midnight">
                      {on}
                      <span className="text-base font-bold text-steel-400">/{items.length}</span>
                    </p>
                    <div className="mt-2 flex justify-end gap-1">
                      {items.map((s) => (
                        <span key={s.slug} className={cn('h-1.5 w-5 rounded-full', s.industries.includes(ind.slug) ? 'bg-gradient-to-r from-emerald to-electric' : 'bg-royal/10')} />
                      ))}
                    </div>
                  </div>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-steel-700">{g.note}</p>

                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {items.map((s) => {
                    const Icon = s.icon
                    const yes = s.industries.includes(ind.slug)
                    return (
                      <li key={s.slug}>
                        {yes ? (
                          <Link
                            to={`/services/${s.slug}`}
                            className="group relative flex items-start gap-4 overflow-hidden rounded-2xl bg-paper p-4 ring-1 ring-royal/10 transition-all duration-500 ease-[var(--ease-out-expo)] hover:bg-midnight hover:shadow-[0_24px_50px_-24px_rgb(9_38_75/0.9)] hover:ring-midnight hover:[transform:translateZ(30px)]"
                          >
                            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-royal text-white shadow-[0_12px_24px_-10px_rgb(8_126_219/0.8)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                              <Icon className="size-5" aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block label-tech text-steel-400 transition-colors group-hover:text-emerald">{s.index}</span>
                              <span className="mt-0.5 block font-semibold leading-snug text-midnight transition-colors group-hover:text-white">{s.title}</span>
                              <span className="mt-1 block text-[0.8125rem] leading-relaxed text-steel-700 transition-colors group-hover:text-steel-300">{s.short}</span>
                            </span>
                            <ArrowUpRight className="mt-1 size-4 shrink-0 text-steel-400 transition duration-500 group-hover:rotate-45 group-hover:text-emerald" aria-hidden />
                          </Link>
                        ) : (
                          <div className="flex items-center gap-4 rounded-2xl border border-dashed border-royal/15 p-4">
                            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-royal/[0.04] text-steel-400">
                              <Icon className="size-5" aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold leading-snug text-steel-500">{s.title}</span>
                              <span className="mt-0.5 block text-xs text-steel-400">Not typical for this sector</span>
                            </span>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </article>
            </Tilt3D>
          )
        })}
      </div>
    </>
  )
}

/** "Sector at a glance" card beside the overview: environments, supporting services and the other sectors. */
export function SectorGlance({ industry: ind, services, others }: { industry: Industry; services: Service[]; others: Industry[] }) {
  return (
    <Tilt3D max={5} lift={12} className="rounded-[1.75rem]" wrapperClassName="reveal">
      <aside className="relative overflow-hidden rounded-[1.75rem] border-metallic surface-metal p-7">
        <Texture variant="lines" className="opacity-40" />
        <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald via-electric to-royal" />
        <p className="relative label-tech text-emerald [transform:translateZ(30px)]">Sector at a glance</p>

        <div className="relative mt-6">
          <p className="label-tech text-steel-500">Operating environments</p>
          <ul className="mt-3 space-y-2">
            {ind.context.map((c, i) => (
              <li key={c} className="flex items-center gap-3 text-sm text-white">
                <span className="font-mono text-xs text-emerald">{pad(i + 1)}</span>
                <span className="h-px w-4 bg-silver/25" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-6 border-t border-white/10 pt-6">
          <p className="label-tech text-steel-500">Supporting services</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex -space-x-2">
              {services.slice(0, 6).map((s) => (
                <span key={s.slug} title={s.title} className="inline-flex size-9 items-center justify-center rounded-full border-2 border-deep bg-gradient-to-br from-electric to-royal text-white">
                  <s.icon className="size-4" aria-hidden />
                </span>
              ))}
            </div>
            <a href="#services" className="text-sm font-semibold text-white transition hover:text-emerald">
              {services.length} services <ArrowDown className="inline size-3.5" aria-hidden />
            </a>
          </div>
        </div>

        <div className="relative mt-6 border-t border-white/10 pt-6">
          <p className="label-tech text-steel-500">Other sectors</p>
          <ul className="mt-3 space-y-1">
            {others.map((o) => (
              <li key={o.slug}>
                <Link to={`/industries/${o.slug}`} className="group flex items-center gap-3 rounded-xl py-1.5 text-sm text-steel-200 transition hover:text-white">
                  <span className="inline-flex size-7 items-center justify-center rounded-lg bg-white/5 text-teal-300 transition group-hover:bg-emerald group-hover:text-midnight">
                    <o.icon className="size-3.5" aria-hidden />
                  </span>
                  <span className="flex-1">{o.title}</span>
                  <ArrowUpRight className="size-3.5 opacity-0 transition group-hover:opacity-100" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </Tilt3D>
  )
}

/**
 * Delivery timeline: a rail that fills as the section scrolls through the
 * viewport, lighting each step in turn. Vertical on phones.
 */
export function DeliveryTimeline({ steps }: { steps: { title: string; desc: string }[] }) {
  const ref = useRef<HTMLOListElement>(null)
  const reduced = usePrefersReducedMotion()
  const [lit, setLit] = useState(reduced ? steps.length : 0)

  useGSAP(
    () => {
      if (reduced) return
      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 78%',
        end: 'bottom 55%',
        scrub: 0.6,
        onUpdate: (self) => {
          ref.current?.style.setProperty('--fill', self.progress.toFixed(3))
          const n = Math.min(steps.length, Math.floor(self.progress * steps.length + 0.35))
          setLit((p) => (p === n ? p : n))
        },
      })
      return () => st.kill()
    },
    { scope: ref, dependencies: [reduced, steps.length] },
  )

  return (
    <ol ref={ref} className="relative mt-16 grid gap-8 lg:grid-cols-4 lg:gap-6" style={{ ['--fill' as string]: reduced ? 1 : 0 }}>
      {/* Rails */}
      <span aria-hidden className="absolute left-7 top-7 hidden h-0.5 bg-royal/10 lg:block" style={{ right: `calc(${100 / steps.length}% - 1.75rem)` }} />
      <span
        aria-hidden
        className="absolute left-7 top-7 hidden h-0.5 origin-left bg-gradient-to-r from-emerald via-electric to-royal lg:block"
        style={{ right: `calc(${100 / steps.length}% - 1.75rem)`, transform: 'scaleX(var(--fill))' }}
      />
      <span aria-hidden className="absolute bottom-7 left-7 top-7 w-0.5 bg-royal/10 lg:hidden" />
      <span aria-hidden className="absolute bottom-7 left-7 top-7 w-0.5 origin-top bg-gradient-to-b from-emerald via-electric to-royal lg:hidden" style={{ transform: 'scaleY(var(--fill))' }} />

      {steps.map((s, i) => {
        const on = i < lit
        return (
          <li key={s.title} className="relative grid grid-cols-[3.5rem_1fr] gap-5 lg:block">
            <span
              className={cn(
                'relative z-10 inline-flex size-14 items-center justify-center rounded-full font-mono text-sm font-semibold ring-4 ring-paper transition-all duration-700 ease-[var(--ease-out-expo)]',
                on ? 'scale-100 bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_14px_30px_-10px_rgb(0_185_154/0.8)]' : 'scale-90 bg-white text-steel-400 ring-offset-0 shadow-[inset_0_0_0_1px_rgb(9_38_75/0.12)]',
              )}
            >
              {on ? <Check className="size-5" aria-hidden /> : pad(i + 1)}
            </span>
            <Tilt3D max={7} lift={14} className="h-full rounded-[1.5rem]" wrapperClassName="lg:mt-8 h-full">
              <div
                className={cn(
                  'relative h-full overflow-hidden rounded-[1.5rem] bg-white p-6 ring-1 transition-[box-shadow,transform] duration-700',
                  on ? 'shadow-[0_40px_70px_-40px_rgb(8_126_219/0.55)] ring-emerald/30' : 'shadow-[0_24px_50px_-40px_rgb(9_38_75/0.5)] ring-royal/10',
                )}
              >
                <span aria-hidden data-wm={pad(i + 1)} className="absolute -right-2 -top-5 font-display text-[6rem] font-black leading-none text-royal/[0.05]" />
                <p className={cn('relative label-tech transition-colors', on ? 'text-teal-600' : 'text-steel-400')}>Step {pad(i + 1)}</p>
                <h3 className="relative mt-2 font-display text-2xl font-bold text-midnight [transform:translateZ(30px)]">{s.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-steel-700">{s.desc}</p>
                <span aria-hidden className={cn('absolute inset-x-0 bottom-0 h-1 origin-left bg-gradient-to-r from-emerald via-electric to-royal transition-transform duration-700', on ? 'scale-x-100' : 'scale-x-0')} />
              </div>
            </Tilt3D>
          </li>
        )
      })}
    </ol>
  )
}
