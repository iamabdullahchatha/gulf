import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Check, Eye, Gauge, HardHat, Layers, MapPinned, RotateCw, Ruler, ShieldCheck, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'
import { Texture } from '@/components/Texture'
import { Tilt3D } from '@/components/animations/Tilt3D'

const REASONS = [
  { icon: Layers, t: 'Integrated delivery', tag: 'One contract. One owner.', d: 'Engineering, construction and operations support under one contract and one point of accountability.', points: ['Fewer interfaces and handovers', 'A single schedule and reporting line'] },
  { icon: HardHat, t: 'Safety-first culture', tag: 'Everyone home, every day.', d: 'Risk is planned before mobilisation and stop-work authority sits with everyone on site.', points: ['Permit-to-work respected without exception', 'Toolbox talks and job-specific risk reviews'] },
  { icon: MapPinned, t: 'Regional know-how', tag: 'Built for Gulf conditions.', d: 'Teams familiar with the region’s climate, standards, logistics and supply chains.', points: ['Desert and offshore site experience', 'Established regional supplier network'] },
  { icon: Ruler, t: 'Engineering rigour', tag: 'Decisions grounded in data.', d: 'Sound design practice and honest technical review behind every recommendation.', points: ['Independent checks on critical scopes', 'Clear documentation from design to handover'] },
  { icon: Gauge, t: 'Planned to your window', tag: 'Your schedule comes first.', d: 'Resourcing and sequencing built around your operating and shutdown windows.', points: ['Detailed mobilisation planning', 'Turnaround-ready crews and equipment'] },
  { icon: Eye, t: 'Transparent reporting', tag: 'No surprises.', d: 'Named owners and clear progress reporting from mobilisation to handover.', points: ['Regular progress and HSE reporting', 'Open escalation routes'] },
]

/**
 * 05 — Why GULF NEXT. A layered 3D photograph beside six flip cards: the
 * front states the commitment, the back explains how it is delivered.
 * Hover (or keyboard focus) flips a card; on touch screens a tap flips it.
 */
export function WhyChooseUs() {
  return (
    <section id="why" className="theme-light relative overflow-hidden bg-paper py-28 md:py-36" aria-label="Why choose GULF NEXT">
      <Texture variant="grid-light" />
      <Texture variant="glow-light" />
      <Container className="relative grid gap-14 lg:grid-cols-[0.95fr_1.3fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading tone="light" index="05" eyebrow="Why GULF NEXT" title={<>The partner you want on a <em>critical</em> scope.</>} lead="Six commitments that shape how every project is planned, staffed and delivered." />

          <Tilt3D max={8} lift={16} wrapperClassName="reveal mt-10" className="rounded-[1.75rem]">
            <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_40px_80px_-34px_rgb(9_38_75/0.55)]">
              <img src="/assets/images/sections/why-gulf-next.webp" alt="GULF NEXT engineering team collaborating at a refinery with safety equipment" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent" />
            </div>
            {/* Floating depth badges */}
            <span className="absolute -right-3 top-6 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-midnight shadow-[0_20px_40px_-18px_rgb(9_38_75/0.6)] [transform:translateZ(70px)] max-sm:right-3">
              <ShieldCheck className="size-4 text-teal-500" aria-hidden /> Safety first
            </span>
            <span className="absolute -left-3 top-1/2 inline-flex items-center gap-2 rounded-2xl bg-midnight px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-18px_rgb(3_13_29/0.7)] [transform:translateZ(55px)] max-sm:left-3">
              <Users className="size-4 text-teal-300" aria-hidden /> One accountable team
            </span>
            <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-4 rounded-2xl bg-white/92 px-5 py-4 backdrop-blur-md [transform:translateZ(40px)]">
              <div>
                <p className="label-tech text-teal-500">How we work</p>
                <p className="mt-1 font-display font-semibold text-midnight">Scope · Plan · Execute · Hand over</p>
              </div>
              <Link to="/about" aria-label="How we work" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-royal text-white transition hover:bg-electric">
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Tilt3D>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {REASONS.map((r, i) => (
            <FlipCard key={r.t} reason={r} index={i} />
          ))}
        </div>
      </Container>
    </section>
  )
}

function FlipCard({ reason, index }: { reason: (typeof REASONS)[number]; index: number }) {
  const [flipped, setFlipped] = useState(false)
  const Icon = reason.icon
  const n = String(index + 1).padStart(2, '0')
  return (
    <div className="group/flip reveal h-[19rem] [perspective:1400px]">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        aria-label={`${reason.t}: ${reason.d}`}
        className={cn(
          'group relative h-full w-full text-left transition-transform duration-[900ms] ease-[var(--ease-out-expo)] [transform-style:preserve-3d]',
          'group-hover/flip:[transform:rotateY(180deg)] focus-visible:[transform:rotateY(180deg)] focus-visible:outline-none',
          flipped && '[transform:rotateY(180deg)]',
        )}
      >
        {/* Front */}
        <span className="absolute inset-0 flex flex-col rounded-3xl card-light p-7 [backface-visibility:hidden]">
          <span className="flex items-start justify-between">
            <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-royal text-white shadow-[0_14px_28px_-12px_rgb(8_126_219/0.8)]">
              <Icon className="size-6" aria-hidden />
            </span>
            <span className="font-display text-5xl font-black text-steel-200">{n}</span>
          </span>
          <span className="mt-auto block font-display text-2xl font-bold text-midnight">{reason.t}</span>
          <span className="mt-2 block text-sm text-steel-700">{reason.tag}</span>
          <span className="mt-5 flex items-center gap-2 label-tech text-teal-500">
            <RotateCw className="size-3.5" aria-hidden />
            <span className="[@media(hover:none)]:hidden">Hover to explore</span>
            <span className="hidden [@media(hover:none)]:inline">Tap to explore</span>
          </span>
        </span>

        {/* Back */}
        <span className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl bg-[linear-gradient(145deg,#087edb_0%,#073b75_60%,#06172f_100%)] p-7 text-white shadow-[0_30px_60px_-28px_rgb(8_126_219/0.7)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Texture variant="lines" className="opacity-40" />
          <span className="relative flex items-center justify-between">
            <span className="label-tech text-teal-300">{n} · Commitment</span>
            <Icon className="size-5 text-white/80" aria-hidden />
          </span>
          <span className="relative mt-4 block font-display text-xl font-bold">{reason.t}</span>
          <span className="relative mt-2 block text-sm leading-relaxed text-white/85">{reason.d}</span>
          <span className="relative mt-auto block space-y-2">
            {reason.points.map((p) => (
              <span key={p} className="flex items-start gap-2 text-sm text-white/90">
                <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald text-midnight">
                  <Check className="size-2.5" aria-hidden />
                </span>
                {p}
              </span>
            ))}
          </span>
        </span>
      </button>
    </div>
  )
}
