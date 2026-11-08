import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'
import { Texture } from '@/components/Texture'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { COMPANY_FAQ } from '@/data/faq'

/**
 * 06 — FAQs. Question cards that lift in 3D on hover and open smoothly,
 * beside a floating 3D help panel that routes to the team.
 */
export function FaqShowcase() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="theme-light relative overflow-hidden bg-white py-28 md:py-36" aria-label="Frequently asked questions">
      <Texture variant="grid-light" className="opacity-70" />
      <Container className="relative grid gap-14 lg:grid-cols-[1fr_1.55fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading tone="light" index="06" eyebrow="FAQs" title={<>Questions, <em>answered</em>.</>} lead="The things operators and contractors ask us most before a project starts." />

          <Tilt3D max={10} lift={20} wrapperClassName="reveal mt-10" className="rounded-[1.75rem]">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(150deg,#0b4c93_0%,#073b75_45%,#06172f_100%)] p-8 shadow-[0_40px_80px_-30px_rgb(9_38_75/0.6)]">
              <Texture variant="lines" className="opacity-50" />
              <span aria-hidden className="absolute -right-10 -top-10 size-56 rounded-full border border-white/10" />
              <span aria-hidden className="absolute -right-20 -top-20 size-80 rounded-full border border-white/[0.06]" />
              <p className="relative label-tech text-teal-300">Still have a question?</p>
              <p className="relative mt-3 max-w-xs font-display text-2xl font-bold text-white">Talk directly to an engineer about your scope.</p>
              <div className="relative mt-8 flex flex-wrap gap-3">
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-midnight transition hover:bg-emerald hover:text-white">
                  Talk to our team <ArrowUpRight className="size-4" aria-hidden />
                </Link>
                <Link to="/about#faq" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white">
                  All questions <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute right-8 top-6 font-serif text-[7.5rem] italic leading-none text-metallic [transform:translateZ(80px)] drop-shadow-[0_20px_30px_rgb(3_13_29/0.5)]"
            >
              ?
            </span>
          </Tilt3D>
        </div>

        <ol className="grid content-start gap-4">
          {COMPANY_FAQ.map((item, i) => {
            const isOpen = open === i
            const id = `home-faq-${i}`
            return (
              <li key={item.q} className="reveal [perspective:1200px]">
                <div
                  className={cn(
                    'group relative overflow-hidden rounded-2xl transition-all duration-500 ease-[var(--ease-out-expo)] [transform-style:preserve-3d]',
                    isOpen
                      ? 'bg-white shadow-[0_30px_60px_-30px_rgb(8_126_219/0.45)] ring-1 ring-electric/25'
                      : 'card-light hover:[transform:rotateX(5deg)_translateY(-4px)] hover:shadow-[0_30px_50px_-28px_rgb(9_38_75/0.45)]',
                  )}
                >
                  <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald to-electric transition-transform duration-500', isOpen ? 'scale-y-100' : 'scale-y-0')} />
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${id}-panel`}
                      id={`${id}-btn`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center gap-5 px-6 py-6 text-left md:px-8"
                    >
                      <span
                        className={cn(
                          'inline-flex size-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs transition-all duration-500',
                          isOpen ? 'bg-gradient-to-br from-emerald to-electric text-white shadow-[0_10px_24px_-10px_rgb(0_185_154/0.8)]' : 'bg-paper text-royal',
                        )}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={cn('flex-1 font-display text-lg font-semibold transition-colors md:text-xl', isOpen ? 'text-midnight' : 'text-steel-700 group-hover:text-midnight')}>{item.q}</span>
                      <span
                        className={cn(
                          'inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-500',
                          isOpen ? 'rotate-45 bg-midnight text-white' : 'bg-paper text-royal group-hover:bg-electric group-hover:text-white',
                        )}
                      >
                        <Plus className="size-4" aria-hidden />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`${id}-panel`}
                    role="region"
                    aria-labelledby={`${id}-btn`}
                    className={cn('grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
                  >
                    <div className="overflow-hidden" inert={!isOpen}>
                      <p className="px-6 pb-7 pl-[5.25rem] leading-relaxed text-steel-700 md:px-8 md:pl-[5.75rem]">{item.a}</p>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}
