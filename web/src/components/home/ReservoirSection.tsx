import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/cn'
import { Container } from '@/components/Container'
import { Texture } from '@/components/Texture'
import { SectionHeading } from '@/components/SectionHeading'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { ArrowDown, Crosshair, Drill, Layers, Pickaxe } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const STAGES = [
  {
    icon: Crosshair,
    t: 'Survey & Plan',
    d: 'Subsurface data and site conditions shape the well plan before anything moves.',
    stat: 'Data-driven',
    statLabel: 'approach',
  },
  {
    icon: Drill,
    t: 'Drill & Case',
    d: 'The wellbore is drilled and cased through each formation to the cap rock.',
    stat: 'Precision',
    statLabel: 'engineering',
  },
  {
    icon: Layers,
    t: 'Steer the Lateral',
    d: 'The bit turns horizontal to stay inside the oil-bearing sandstone.',
    stat: 'Directional',
    statLabel: 'control',
  },
  {
    icon: Pickaxe,
    t: 'Complete & Produce',
    d: 'The lateral is perforated and the well is brought into production.',
    stat: 'Steady',
    statLabel: 'production',
  },
]

const LAYERS: [string, number, string][] = [
  ['Overburden', 120, '#0d2e58'],
  ['Shale', 260, '#0a2548'],
  ['Cap rock', 372, '#143f72'],
  ['Reservoir sandstone', 430, '#0b3b4d'],
  ['Aquifer', 560, '#071e3d'],
]
const WAVE = (y: number, amp = 10) => `M0 ${y} C 180 ${y - amp}, 320 ${y + amp}, 500 ${y} S 820 ${y - amp}, 1000 ${y}`

export function ReservoirSection() {
  const wrapRef = useRef<HTMLElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const bitRef = useRef<SVGGElement>(null)
  const perfRef = useRef<SVGGElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const labelRefs = useRef<(SVGGElement | null)[]>([])
  const [stage, setStage] = useState(0)
  const desktop = useMediaQuery('(min-width: 1024px)')
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const wrap = wrapRef.current
    const path = pathRef.current
    if (!wrap || !path) return
    const len = path.getTotalLength()
    path.style.strokeDasharray = `${len}`

    const apply = (p: number) => {
      path.style.strokeDashoffset = `${len * (1 - p)}`
      const pt = path.getPointAtLength(len * p)
      bitRef.current?.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`)
      if (perfRef.current) perfRef.current.style.opacity = String(Math.max(0, (p - 0.86) / 0.14))
      if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}`.padStart(3, '0')
      labelRefs.current.forEach((g, i) => {
        const top = LAYERS[i]![1]
        if (g) g.style.opacity = pt.y + 8 >= top || (i === 3 && p > 0.5) ? '1' : '0.28'
      })
      const s = p < 0.12 ? 0 : p < 0.5 ? 1 : p < 0.86 ? 2 : 3
      setStage((prev) => (prev === s ? prev : s))
    }

    if (reduced) {
      apply(1)
      return
    }
    const st = ScrollTrigger.create({
      trigger: wrap,
      start: desktop ? 'top top' : 'top 70%',
      end: desktop ? 'bottom bottom' : 'bottom 70%',
      scrub: 0.5,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    })
    apply(st.progress)
    return () => st.kill()
  }, [desktop, reduced])

  return (
    <section ref={wrapRef} id="reservoir" className="relative bg-[linear-gradient(160deg,#0b4c93_0%,#073b75_45%,#09264b_100%)] lg:h-[200svh]" aria-label="Beneath the surface">
      <div className="relative overflow-hidden lg:sticky lg:top-0 lg:h-svh">
        <Texture variant="grid" />
        {/* Ambient glow effects */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-48 top-1/4 size-[40rem] rounded-full bg-electric/8 blur-[160px]" />
          <div className="absolute -right-32 bottom-1/4 size-[36rem] rounded-full bg-emerald/6 blur-[140px]" />
        </div>

        <Container className="relative grid h-full items-center gap-12 py-24 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-0">
          {/* Left column — heading + stage cards */}
          <div>
            <SectionHeading
              reveal={false}
              index="01"
              eyebrow="Beneath the surface"
              title={<>Reaching the <em>reservoir</em>.</>}
            />
            <p className="mt-6 max-w-md text-steel-200 md:text-lg leading-relaxed">
              Every barrel begins far below the rig floor. We support the work that takes a well from
              survey to steady production — with precision engineering at every stage.
            </p>

            {/* Stage cards */}
            <div className="mt-10 space-y-2">
              {STAGES.map((s, i) => {
                const Icon = s.icon
                const active = stage === i
                return (
                  <div
                    key={s.t}
                    className={cn(
                      'group grid grid-cols-[3rem_1fr_auto] items-start gap-4 rounded-2xl border p-5 transition-all duration-500',
                      active
                        ? 'border-emerald/40 bg-white/[0.08] shadow-[0_8px_32px_-12px_rgb(0_185_154/0.25)] backdrop-blur-sm'
                        : 'border-white/[0.06] bg-white/[0.02] opacity-60 hover:opacity-80',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex size-12 items-center justify-center rounded-xl transition-all duration-500',
                        active
                          ? 'bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_12px_24px_-8px_rgb(0_185_154/0.5)]'
                          : 'bg-white/[0.06] text-steel-400',
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="flex items-center gap-2">
                        <span className={cn('font-mono text-xs', active ? 'text-emerald' : 'text-steel-500')}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="block font-display font-semibold text-white">{s.t}</span>
                      </span>
                      <span
                        className={cn(
                          'block overflow-hidden text-sm text-steel-400 transition-all duration-500',
                          active ? 'mt-2 max-h-24 text-steel-200' : 'max-h-0',
                        )}
                      >
                        {s.d}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'text-right transition-all duration-500',
                        active ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      <span className="block font-display text-lg font-bold text-emerald">{s.stat}</span>
                      <span className="block text-xs text-steel-400">{s.statLabel}</span>
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Scroll hint */}
            <div className="mt-8 hidden items-center gap-2 text-steel-500 lg:flex">
              <ArrowDown className="size-4 animate-bounce" aria-hidden />
              <span className="label-tech">Scroll to explore</span>
            </div>
          </div>

          {/* Right column — cross-section illustration */}
          <Tilt3D max={5} lift={12} glare={false} className="rounded-[2rem]">
            <figure className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-midnight/60 shadow-[0_40px_100px_-30px_rgb(3_13_29/0.8)] backdrop-blur-sm">
              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald/15">
                    <Layers className="size-4 text-emerald" aria-hidden />
                  </span>
                  <span className="font-display text-sm font-semibold text-white">Geological Cross-Section</span>
                </div>
                <span className="label-tech text-steel-500">Interactive</span>
              </div>

              <svg viewBox="0 0 1000 700" className="block h-auto w-full" role="img" aria-labelledby="reservoir-title">
                <title id="reservoir-title">Illustrative cross-section of a well drilled through rock strata into an oil reservoir</title>
                <defs>
                  <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                    <line x1="0" y1="0" x2="0" y2="10" stroke="#c5ced8" strokeOpacity="0.07" strokeWidth="2" />
                  </pattern>
                  <pattern id="pores" width="26" height="18" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="2.2" fill="#00b99a" fillOpacity="0.55" />
                    <circle cx="18" cy="13" r="1.6" fill="#4dd6bd" fillOpacity="0.4" />
                  </pattern>
                  <linearGradient id="oil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#00b99a" stopOpacity="0.35" />
                    <stop offset="1" stopColor="#087edb" stopOpacity="0.12" />
                  </linearGradient>
                  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#09264b" />
                    <stop offset="1" stopColor="#0b3a70" />
                  </linearGradient>
                  <filter id="glow"><feGaussianBlur stdDeviation="6" /></filter>
                  <filter id="glow-sm"><feGaussianBlur stdDeviation="3" /></filter>
                </defs>

                <rect width="1000" height="120" fill="url(#sky)" />
                {LAYERS.map(([name, top, color], i) => {
                  const next = LAYERS[i + 1]?.[1] ?? 720
                  return (
                    <g key={name}>
                      <path d={`${WAVE(top)} L1000 ${next + 10} L0 ${next + 10} Z`} fill={color} />
                      <path d={`${WAVE(top)} L1000 ${next + 10} L0 ${next + 10} Z`} fill={i === 3 ? 'url(#pores)' : 'url(#hatch)'} />
                      {i === 3 && <path d={`${WAVE(top)} L1000 ${next + 10} L0 ${next + 10} Z`} fill="url(#oil)" />}
                      <path d={WAVE(top)} fill="none" stroke="#c5ced8" strokeOpacity="0.18" />
                    </g>
                  )
                })}

                {/* Rig on the surface */}
                <g stroke="#e3e8ee" strokeWidth="2" fill="none" opacity="0.9">
                  <path d="M282 120 L300 36 L318 120 M287 98 L313 98 M291 78 L309 78 M295 58 L305 58" />
                  <rect x="268" y="112" width="64" height="8" fill="#c5ced8" stroke="none" />
                </g>
                <circle cx="300" cy="34" r="4" fill="#00b99a" filter="url(#glow-sm)" />
                <circle cx="300" cy="34" r="3" fill="#00b99a" />

                {/* Wellbore path */}
                <path d="M300 120 L300 400 Q300 492 392 496 L880 500" fill="none" stroke="#c5ced8" strokeOpacity="0.12" strokeWidth="10" strokeLinecap="round" />
                <path ref={pathRef} d="M300 120 L300 400 Q300 492 392 496 L880 500" fill="none" stroke="url(#wellbore-gradient)" strokeWidth="4" strokeLinecap="round" />

                <defs>
                  <linearGradient id="wellbore-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#087edb" />
                    <stop offset="0.5" stopColor="#00b99a" />
                    <stop offset="1" stopColor="#4dd6bd" />
                  </linearGradient>
                </defs>

                <g ref={perfRef} style={{ opacity: 0 }}>
                  {[460, 540, 620, 700, 780, 850].map((x) => (
                    <g key={x}>
                      <line x1={x} y1="478" x2={x} y2="462" stroke="#4dd6bd" strokeWidth="2" opacity="0.8" />
                      <line x1={x} y1="520" x2={x} y2="536" stroke="#4dd6bd" strokeWidth="2" opacity="0.8" />
                    </g>
                  ))}
                </g>

                <g ref={bitRef} transform="translate(300 120)">
                  <circle r="20" fill="#00b99a" opacity="0.2" filter="url(#glow)" />
                  <circle r="10" fill="#00b99a" opacity="0.4" filter="url(#glow-sm)" />
                  <circle r="6" fill="#ffffff" />
                </g>

                {LAYERS.map(([name, top], i) => (
                  <g
                    key={name}
                    ref={(el) => {
                      labelRefs.current[i] = el
                    }}
                    style={{ transition: 'opacity .5s' }}
                    opacity="0.28"
                  >
                    {/* The SVG scales down with the screen; on phones a 13-unit label would render ~5px tall. */}
                    <line x1="40" y1={top + (desktop ? 22 : 27)} x2="70" y2={top + (desktop ? 22 : 27)} stroke="#00b99a" />
                    <text x="78" y={top + (desktop ? 27 : 37)} fill="#e3e8ee" fontFamily="JetBrains Mono, monospace" fontSize={desktop ? 13 : 28} letterSpacing={desktop ? 2 : 1}>
                      {name.toUpperCase()}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Bottom status bar */}
              <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] bg-midnight/40 px-6 py-4">
                <div className="flex items-center gap-4">
                  <span className="label-tech text-steel-500">Cross-section</span>
                  <span className="h-3 w-px bg-white/10" aria-hidden />
                  <span className="label-tech text-steel-500">Not to scale</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="label-tech text-steel-400">Wellbore</span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald/15 px-3 py-1.5">
                    <span ref={pctRef} className="font-mono text-sm font-semibold text-emerald">000</span>
                    <span className="text-xs text-emerald/70">%</span>
                  </span>
                </div>
              </figcaption>
            </figure>
          </Tilt3D>
        </Container>
      </div>
    </section>
  )
}
