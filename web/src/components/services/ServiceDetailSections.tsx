import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowDown, ArrowUpRight, Check, Wrench } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Container } from '@/components/Container'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Picture } from '@/components/Picture'
import { Texture } from '@/components/Texture'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { buttonStyles } from '@/lib/buttonStyles'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { Service } from '@/data/services'
import type { Industry } from '@/data/industries'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Service detail hero. The service's own inner photograph sets the mood as a
 * blurred full-bleed backdrop, and appears sharp in a tilted 3D frame that
 * follows the pointer, with an "at a glance" card floating in front of it.
 * The frame keeps every photo near its native size, so none is upscaled.
 */
export function ServiceHero({ service: s, total, industries }: { service: Service; total: number; industries: Industry[] }) {
  const ref = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const Icon = s.icon

  useGSAP(
    () => {
      // Hand over from the pre-rendered start frame (index.css) to GSAP in the same task.
      ref.current?.removeAttribute('data-intro')
      if (reduced) return
      gsap.fromTo('[data-hero-bg]', { scale: 1.3 }, { scale: 1.12, duration: 2.8, ease: 'expo.out' })
      // Hero entrances start at 1% opacity, not 0: identical to the eye, but the
      // browser counts them as painted on the first frame (Largest Contentful Paint).
      gsap.from('[data-hero-in]', { y: 50, opacity: 0.01, duration: 1.3, ease: 'expo.out', stagger: 0.08, delay: 0.1 })
      gsap.from('[data-hero-frame]', { rotateY: -55, rotateX: 12, z: -300, opacity: 0.01, duration: 2, ease: 'expo.out', delay: 0.2 })
      gsap.from('[data-hero-card]', { y: 90, z: -120, opacity: 0.01, duration: 1.6, ease: 'expo.out', delay: 0.7 })
      gsap.to('[data-hero-bg]', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('[data-hero-frame-wrap]', { y: -120, rotateX: 10, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('[data-hero-copy]', { y: -80, opacity: 0, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom 15%', scrub: true } })
    },
    { scope: ref, dependencies: [s.slug, reduced] },
  )

  return (
    <section
      ref={ref}
      data-intro="service"
      className="relative isolate flex min-h-svh items-center overflow-hidden bg-midnight pb-20 pt-36"
      aria-label={s.title}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== 'mouse' || !frameRef.current) return
        const r = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        frameRef.current.style.transform = `rotateY(${(-14 + x * 16).toFixed(2)}deg) rotateX(${(4 - y * 10).toFixed(2)}deg)`
      }}
      onPointerLeave={() => {
        if (frameRef.current) frameRef.current.style.transform = ''
      }}
    >
      <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
        <Picture data-hero-bg src={s.innerImageSmall} alt="" loading="eager" className="h-full w-full scale-110 object-cover opacity-70 blur-2xl saturate-[1.2]" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-midnight via-midnight/85 to-midnight/40" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-transparent to-midnight/60" />
      <Texture variant="grid" className="-z-10 opacity-50" />

      <Container className="relative grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div data-hero-copy>
          <div data-hero-in>
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: s.title }]} />
          </div>
          <p data-hero-in className="mt-8 flex items-center gap-4">
            <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_18px_40px_-10px_rgb(0_185_154/0.8)]">
              <Icon className="size-6" aria-hidden />
            </span>
            <span className="label-tech text-white">
              Service <span className="text-emerald">{s.index}</span> / {String(total).padStart(2, '0')}
            </span>
          </p>
          <h1 data-hero-in className="mt-6 text-display-xl font-bold text-white">{s.title}</h1>
          <p data-hero-in className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{s.description}</p>
          <div data-hero-in className="mt-9 flex flex-wrap gap-3">
            <Link to="/contact" className={buttonStyles({ variant: 'emerald', size: 'lg' })}>
              Send an inquiry <ArrowUpRight className="size-4" aria-hidden />
            </Link>
            <Link to="/services" className={buttonStyles({ variant: 'ghost', size: 'lg' })}>
              All services
            </Link>
          </div>
        </div>

        <div data-hero-frame-wrap className="relative mx-auto w-full max-w-[36rem] [perspective:1600px] lg:mr-0">
          <div ref={frameRef} data-hero-frame className="relative transition-transform duration-700 ease-out [transform-style:preserve-3d] lg:[transform:rotateY(-14deg)_rotateX(4deg)]">
            <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] border border-emerald/20 [transform:translateZ(-60px)]" />
            <div aria-hidden className="absolute -inset-12 rounded-[3rem] border border-electric/10 [transform:translateZ(-120px)]" />
            <figure className="relative overflow-hidden rounded-[2rem] shadow-[0_60px_120px_-40px_rgb(0_0_0/0.9)] ring-1 ring-white/20">
              <Picture src={s.innerImage} small={s.innerImageSmall} alt={`${s.title} by GULF NEXT`} loading="eager" fetchPriority="high" className="aspect-[4/3] w-full object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-midnight/50 via-transparent to-white/10" />
              <span className="absolute right-5 top-5 rounded-full bg-midnight/60 px-3 py-1.5 label-tech text-white ring-1 ring-white/20 backdrop-blur-md">{s.index}</span>
            </figure>

            <div data-hero-card className="absolute -bottom-10 -left-4 w-[78%] sm:-left-10 sm:w-[64%] [transform:translateZ(90px)]">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/15 bg-midnight/70 p-6 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] backdrop-blur-xl">
                <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald via-electric to-royal" />
                <p className="label-tech text-emerald">At a glance</p>
                <ul className="mt-4 space-y-2.5">
                  {s.highlights.slice(0, 3).map((h) => (
                    <li key={h} className="flex items-start gap-3 text-sm text-white">
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald/20 text-emerald">
                        <Check className="size-3" aria-hidden />
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {industries.length > 0 && (
              <ul className="absolute -right-3 top-10 hidden flex-col items-end gap-2 sm:flex [transform:translateZ(60px)]">
                {industries.map((ind) => {
                  const I = ind.icon
                  return (
                    <li key={ind.slug} className="flex items-center gap-2 rounded-full bg-white/90 py-1.5 pl-2 pr-3.5 text-xs font-semibold text-midnight shadow-[0_14px_30px_-12px_rgb(0_0_0/0.6)] backdrop-blur">
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-royal text-white">
                        <I className="size-3.5" aria-hidden />
                      </span>
                      {ind.title}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </Container>

      <a href="#introduction" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 label-tech text-white/70 transition hover:text-white md:flex">
        Scroll
        <ArrowDown className="size-4 animate-bounce" aria-hidden />
      </a>
    </section>
  )
}

/**
 * "In the field": the service photograph cut into three panels on a curved
 * 3D wall that turns as the section scrolls past. Each panel shows a
 * different slice of the same image at close to its native size.
 */
export function FieldTriptych({ service: s }: { service: Service }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const panels = [
    { rot: 26, z: 0, label: s.capabilities[0] },
    { rot: 0, z: 40, label: s.capabilities[1] },
    { rot: -26, z: 0, label: s.capabilities[2] },
  ]

  useGSAP(
    () => {
      if (reduced) return
      gsap.fromTo('[data-wall]', { rotateY: 16, rotateX: 8 }, { rotateY: -16, rotateX: -4, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
      gsap.from('[data-panel]', { z: -400, opacity: 0, stagger: 0.12, ease: 'expo.out', duration: 1.6, scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true } })
      gsap.from('[data-tri-copy] > *', { y: 40, opacity: 0, stagger: 0.08, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true } })
    },
    { scope: ref, dependencies: [s.slug, reduced] },
  )

  return (
    <section ref={ref} className="relative overflow-hidden bg-midnight py-24 md:py-32" aria-label={`${s.title} in the field`}>
      <Texture variant="grid" />
      <div aria-hidden className="absolute left-1/2 top-1/2 h-[30rem] w-[70rem] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-electric/15 blur-3xl" />
      <Container className="relative">
        <div data-tri-copy className="mx-auto max-w-3xl text-center">
          <p className="flex items-center justify-center gap-3 label-tech text-emerald">
            <span className="h-px w-8 bg-emerald" aria-hidden /> In the field <span className="h-px w-8 bg-emerald" aria-hidden />
          </p>
          <p className="mt-6 text-display-md font-bold text-white">{s.short}</p>
        </div>

        {/* Phones: the photograph whole. */}
        <figure data-panel className="relative mt-12 aspect-[4/3] overflow-hidden rounded-[1.75rem] ring-1 ring-white/15 sm:hidden">
          <Picture src={s.innerImage} small={s.innerImageSmall} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </figure>

        {/* Larger screens: one photograph running across three panels on a curved wall. */}
        <div className="mt-16 hidden [perspective:1800px] sm:block">
          <div data-wall className="mx-auto grid max-w-5xl grid-cols-3 gap-3 [transform-style:preserve-3d]">
            {panels.map((p, i) => (
              <figure
                key={i}
                data-panel
                className="group relative aspect-[4/5] overflow-hidden rounded-[1.5rem] shadow-[0_50px_90px_-40px_rgb(0_0_0/0.9)] ring-1 ring-white/15 transition-transform duration-700 ease-[var(--ease-out-expo)] [transform:rotateY(var(--r))_translateZ(var(--z))] hover:[transform:rotateY(var(--r))_translateZ(calc(var(--z)+60px))]"
                style={{ '--r': `${p.rot}deg`, '--z': `${p.z}px` } as CSSProperties}
              >
                <div className="absolute inset-y-0 w-[calc(300%+1.5rem)]" style={{ left: `calc(${-i * 100}% - ${i * 0.75}rem)` }}>
                  <Picture src={s.innerImage} small={s.innerImageSmall} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                </div>
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/10 to-transparent" />
                <span aria-hidden className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-white/10 via-transparent to-black/20" />
                {p.label && (
                  <figcaption className="absolute inset-x-5 bottom-5">
                    <span className="label-tech text-emerald">{String(i + 1).padStart(2, '0')}</span>
                    <span className="mt-2 block font-display text-base font-semibold leading-snug text-white md:text-lg">{p.label}</span>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

/** Equipment list as a tilting metal panel with the service icon embossed behind it. */
export function EquipmentPanel({ service: s }: { service: Service }) {
  const Icon = s.icon
  return (
    <Tilt3D max={6} lift={14} className="rounded-[2rem]" wrapperClassName="reveal">
      <div className="relative overflow-hidden rounded-[2rem] border-metallic surface-metal p-8 md:p-10">
        <Texture variant="lines" className="opacity-40" />
        <Icon aria-hidden className="absolute -right-10 -top-10 size-64 text-white/[0.04]" />
        <div className="relative flex items-center gap-4 [transform:translateZ(40px)]">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-royal text-white shadow-[0_18px_36px_-12px_rgb(8_126_219/0.9)]">
            <Wrench className="size-6" aria-hidden />
          </span>
          <div>
            <p className="label-tech text-emerald">04 · Equipment & infrastructure</p>
            <h2 className="mt-1 font-display text-3xl font-bold text-white">Tools for the job</h2>
          </div>
        </div>
        <p className="relative mt-5 text-sm leading-relaxed text-steel-400">Typical equipment mobilised for this service. The final list is agreed for each scope.</p>
        <ul className="relative mt-7 space-y-2 [transform:translateZ(24px)]">
          {s.equipment.map((e, i) => (
            <li key={e} className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition duration-300 hover:translate-x-1 hover:border-emerald/30 hover:bg-white/[0.07]">
              <span className="font-mono text-xs text-emerald">{String(i + 1).padStart(2, '0')}</span>
              <span className="h-4 w-px bg-white/15" aria-hidden />
              <span className="text-[0.9375rem] text-steel-200 group-hover:text-white">{e}</span>
            </li>
          ))}
        </ul>
      </div>
    </Tilt3D>
  )
}
