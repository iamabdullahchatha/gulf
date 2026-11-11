import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { INDUSTRIES } from '@/data/industries'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Picture } from '@/components/Picture'

const INTERVAL = 6000

/**
 * 04 — Industries. A sector index on the left drives a large 3D image stage
 * on the right. Advances automatically every few seconds (paused on hover,
 * focus or reduced motion); click or focus any sector to select it.
 * Small screens: a swipeable row of sector cards.
 */
export function IndustriesShowcase() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = usePrefersReducedMotion()
  const barRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (paused || reduced) return
    const bar = barRef.current
    if (bar) {
      bar.style.transition = 'none'
      bar.style.transform = 'scaleX(0)'
      void bar.offsetWidth
      bar.style.transition = `transform ${INTERVAL}ms linear`
      bar.style.transform = 'scaleX(1)'
    }
    const t = window.setTimeout(() => setActive((a) => (a + 1) % INDUSTRIES.length), INTERVAL)
    return () => window.clearTimeout(t)
  }, [active, paused, reduced])

  const current = INDUSTRIES[active]!

  return (
    <section id="industries" className="theme-light relative overflow-hidden bg-white py-28 md:py-36" aria-label="Industries">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <SectionHeading tone="light" index="04" eyebrow="Industries" title={<>Across the energy <em>value chain</em>.</>} />
          <p className="reveal max-w-xl text-steel-700 md:text-lg lg:justify-self-end">
            Oil and gas fields, processing plants, industrial construction and mechanical equipment: sector experience that lets us anticipate problems before they reach the critical path.
          </p>
        </div>

        {/* Desktop: index + stage */}
        <div
          className="reveal mt-16 hidden gap-10 lg:grid lg:grid-cols-[0.85fr_1.45fr]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <ol className="flex flex-col border-t border-royal/10" role="tablist" aria-label="Industries">
            {INDUSTRIES.map((ind, i) => {
              const on = i === active
              const Icon = ind.icon
              return (
                <li key={ind.slug} role="none" className="border-b border-royal/10">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls="industry-stage"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    className="group relative flex w-full items-center gap-5 py-5 text-left"
                  >
                    <span aria-hidden className={cn('absolute left-0 top-0 h-full w-0.5 origin-top bg-gradient-to-b from-emerald to-electric transition-transform duration-500', on ? 'scale-y-100' : 'scale-y-0')} />
                    <span className={cn('label-tech w-8 pl-3 transition-colors', on ? 'text-teal-600' : 'text-steel-400')}>{ind.index}</span>
                    <span
                      className={cn(
                        'inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-500',
                        on ? 'bg-gradient-to-br from-electric to-royal text-white shadow-[0_10px_24px_-10px_rgb(8_126_219/0.8)]' : 'bg-paper text-royal group-hover:bg-electric/10',
                      )}
                    >
                      <Icon className="size-[1.1rem]" aria-hidden />
                    </span>
                    <span className="flex-1">
                      <span className={cn('block font-display text-xl font-semibold transition-colors', on ? 'text-midnight' : 'text-steel-500 group-hover:text-midnight')}>{ind.title}</span>
                      <span className={cn('block overflow-hidden text-sm text-steel-700 transition-all duration-500', on ? 'mt-1 max-h-12 opacity-100' : 'max-h-0 opacity-0')}>{ind.short}</span>
                    </span>
                    <ArrowRight className={cn('size-4 transition-all duration-500', on ? 'translate-x-0 text-royal opacity-100' : '-translate-x-2 opacity-0')} aria-hidden />
                  </button>
                </li>
              )
            })}
          </ol>

          <Tilt3D max={6} lift={14} className="rounded-[2rem]">
            <div id="industry-stage" role="tabpanel" aria-live="polite" className="relative aspect-[16/11] overflow-hidden rounded-[2rem] bg-deep shadow-[0_50px_100px_-40px_rgb(9_38_75/0.65)]">
              {INDUSTRIES.map((ind, i) => (
                <Picture
                  key={ind.slug}
                  src={ind.image}
                  alt=""
                  loading="lazy"
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1200ms] ease-[var(--ease-out-expo)]',
                    i === active ? 'scale-100 opacity-100' : 'scale-110 opacity-0',
                  )}
                />
              ))}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 via-45% to-transparent" />
            </div>

            <div className="absolute inset-x-8 bottom-8 [transform:translateZ(50px)]">
              <span className="label-tech text-teal-300">Industry {current.index}</span>
              <h3 key={current.slug} className="mt-3 animate-[rise_.7s_var(--ease-out-expo)] font-display text-4xl font-bold text-white">{current.title}</h3>
              <p className="mt-3 max-w-xl text-white/85">{current.description}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {current.context.map((c) => (
                  <li key={c} className="rounded-full bg-white/12 px-3 py-1.5 text-xs text-white ring-1 ring-white/25 backdrop-blur-md">{c}</li>
                ))}
              </ul>
              <Link to={`/industries/${current.slug}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-midnight shadow-lg transition hover:bg-emerald hover:text-white">
                Explore the sector <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>

            <span className="absolute inset-x-8 top-8 h-0.5 overflow-hidden rounded-full bg-white/25 [transform:translateZ(30px)]" aria-hidden>
              <span ref={barRef} className="absolute inset-0 origin-left bg-white" style={{ transform: 'scaleX(0)' }} />
            </span>
          </Tilt3D>
        </div>

        {/* Mobile / tablet: swipeable cards */}
        <ul className="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] lg:hidden">
          {INDUSTRIES.map((ind) => (
            <li key={ind.slug} className="w-[82%] shrink-0 snap-center sm:w-[46%]">
              <Link to={`/industries/${ind.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] shadow-[0_24px_50px_-28px_rgb(9_38_75/0.6)]">
                <Picture src={ind.imageSmall} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/30 to-transparent" />
                <div className="absolute inset-x-5 bottom-5">
                  <span className="label-tech text-teal-300">{ind.index}</span>
                  <h3 className="mt-2 font-display text-2xl font-bold text-white">{ind.title}</h3>
                  <p className="mt-2 text-sm text-white/80">{ind.short}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
