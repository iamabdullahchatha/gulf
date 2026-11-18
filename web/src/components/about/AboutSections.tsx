import { useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ClipboardCheck,
  ClipboardList,
  Handshake,
  HardHat,
  Lightbulb,
  MessageCircleQuestion,
  Plus,
  Search,
  ShieldCheck,
  Target,
  Users,
  Wrench,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Container } from '@/components/Container'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { SectionHeading } from '@/components/SectionHeading'
import { Texture } from '@/components/Texture'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { cn } from '@/lib/cn'
import { scrollToElement } from '@/lib/lenis'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { FaqItem } from '@/data/faq'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type Icon = ComponentType<{ className?: string }>

const VALUES: { icon: Icon; title: string; desc: string; detail: string; image: string }[] = [
  { icon: ShieldCheck, title: 'Safety first', desc: 'Every plan starts with how everyone gets home safely.', detail: 'Nothing is worth compromising that. Risk is assessed before mobilisation and stop-work authority sits with everyone on site.', image: '/assets/images/stock/industrial-team-briefing.webp' },
  { icon: Handshake, title: 'Integrity', desc: 'Honest reporting, fair dealing and commitments we keep.', detail: 'Progress, problems and changes are reported as they are, so decisions are made on facts.', image: '/assets/images/stock/engineer-plant-walkway.webp' },
  { icon: Wrench, title: 'Engineering excellence', desc: 'Decisions grounded in sound practice and technical review.', detail: 'Drawings, methods and materials are checked before work starts, not corrected after it ends.', image: '/assets/images/stock/mechanical-flanges-blueprints.webp' },
  { icon: Target, title: 'Accountability', desc: 'Named owners for every scope and clear lines of responsibility.', detail: 'Each package has a named owner who follows it from planning through to handover.', image: '/assets/images/stock/electrical-control-room.webp' },
  { icon: Users, title: 'Collaboration', desc: 'One team with clients, partners and local suppliers.', detail: "We plan with the operator's people, share information openly and work to a single schedule.", image: '/assets/images/stock/steel-truss-installation-crew.webp' },
  { icon: Lightbulb, title: 'Continuous improvement', desc: 'Learning from every job and improving our methods.', detail: 'Lessons are captured at the end of every scope and fed into how the next one is planned.', image: '/assets/images/stock/turbine-compressor-cutaway.webp' },
]

const STEPS: { icon: Icon; step: string; desc: string; points: string[] }[] = [
  { icon: Search, step: 'Scope', desc: 'Objectives, constraints and risks agreed with your team before anything is priced.', points: ['Site walk-down', 'Risk and constraint review', 'Clear scope statement'] },
  { icon: ClipboardList, step: 'Plan', desc: 'Resources, permits and mobilisation sequenced around your operating window.', points: ['Resource and equipment plan', 'Permit and access planning', 'Mobilisation schedule'] },
  { icon: HardHat, step: 'Execute', desc: 'Named supervisors, daily reporting and stop-work authority for everyone on site.', points: ['Daily progress reporting', 'Quality hold points', 'Stop-work authority'] },
  { icon: ClipboardCheck, step: 'Hand over', desc: 'Records completed, punch lists closed and a clean transfer back to operations.', points: ['Inspection records compiled', 'Punch list closed', 'Clean area handback'] },
]

const pad = (n: number) => String(n).padStart(2, '0')

/* ----------------------------------------------------------------------------
 * Core values: six cards on a 3D ring that turns as you scroll.
 * Phones, tablets and reduced motion get a tilting card grid instead.
 * ------------------------------------------------------------------------- */

export function CoreValues() {
  const reduced = usePrefersReducedMotion()
  const desktop = useMediaQuery('(min-width: 1024px)')
  return desktop && !reduced ? <ValuesRing /> : <ValuesGrid />
}

function ValuesRing() {
  const ref = useRef<HTMLElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const pointer = useRef({ x: 0, y: 0 })
  const rot = useRef(0)
  const [active, setActive] = useState(0)
  const N = VALUES.length
  const STEP = 360 / N
  const R = 380

  const paint = () => {
    const ring = ringRef.current
    if (!ring) return
    const { x, y } = pointer.current
    ring.style.transform = `translateZ(${-R}px) rotateX(${(-8 + y * 6).toFixed(2)}deg) rotateY(${(-rot.current + x * 10).toFixed(2)}deg)`
    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const rel = ((((i * STEP - rot.current) % 360) + 540) % 360) - 180
      const facing = Math.max(0, Math.cos((rel * Math.PI) / 180))
      el.style.opacity = (0.15 + 0.85 * facing ** 1.6).toFixed(3)
      el.style.filter = `brightness(${(0.55 + 0.45 * facing).toFixed(3)})`
    })
  }

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        onUpdate: (self) => {
          rot.current = self.progress * (N - 1) * STEP
          paint()
          const a = Math.round(self.progress * (N - 1))
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

  const current = VALUES[active]!

  return (
    <section ref={ref} id="values" className="relative scroll-mt-0 bg-deep" style={{ height: `${N * 70 + 100}svh` }} aria-label="Core values">
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
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_55%,rgb(0_185_154/0.16),transparent_70%)]" />
        <span aria-hidden key={active} className="pointer-events-none absolute -left-6 bottom-0 animate-[rise_.8s_var(--ease-out-expo)] select-none font-display text-[22rem] font-black leading-none text-white/[0.03]">
          {pad(active + 1)}
        </span>

        <Container className="relative grid w-full items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeading reveal={false} index="05" eyebrow="Core values" title={<>Principles that hold <em>under pressure</em>.</>} />
            <div key={active} className="mt-10 min-h-[11rem] animate-[rise_.6s_var(--ease-out-expo)]">
              <p className="flex items-center gap-3 label-tech text-emerald">
                <span>Value {pad(active + 1)}</span>
                <span className="h-px w-10 bg-gradient-to-r from-emerald to-transparent" />
                <span className="text-steel-500">of {pad(N)}</span>
              </p>
              <h3 className="mt-4 font-display text-4xl font-bold text-white">{current.title}</h3>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-steel-300">{current.detail}</p>
            </div>
            <div className="mt-8 flex items-center" role="tablist" aria-label="Core values">
              {VALUES.map((v, i) => (
                <button
                  key={v.title}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={v.title}
                  onClick={() => goTo(i)}
                  className="group/dot inline-flex h-6 min-w-6 items-center justify-center"
                >
                  <span className={cn('h-2 rounded-full transition-all duration-500', i === active ? 'w-10 bg-gradient-to-r from-emerald to-electric' : 'w-2 bg-silver/25 group-hover/dot:bg-silver/60')} />
                </button>
              ))}
              <span className="ml-4 label-tech text-steel-500">Scroll to turn</span>
            </div>
          </div>

          {/* The ring is sized for wide screens; 1024–1279px (iPad landscape, small laptops) shows it at 78% so it clears the copy and the screen edge. */}
          <div className="relative h-[34rem] [perspective:1700px] lg:max-xl:scale-[0.78]">
            <div className="absolute left-1/2 top-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald/10 [transform:rotateX(78deg)]" aria-hidden />
            <div ref={ringRef} className="absolute inset-0 transition-transform duration-300 ease-out [transform-style:preserve-3d]">
              {VALUES.map((v, i) => (
                <div
                  key={v.title}
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  className="absolute left-1/2 top-1/2 -ml-[9.5rem] -mt-[11.5rem] h-[23rem] w-[19rem] [backface-visibility:hidden]"
                  style={{ transform: `rotateY(${i * STEP}deg) translateZ(${R}px)` }}
                >
                  <article
                    className={cn(
                      'relative flex h-full flex-col overflow-hidden rounded-[1.75rem] ring-1 transition-[box-shadow,background-color] duration-700',
                      i === active
                        ? 'shadow-[0_40px_80px_-30px_rgb(0_185_154/0.5)] ring-emerald/50'
                        : 'bg-midnight/80 ring-silver/10',
                    )}
                  >
                    {/* Photo banner — top 55% of card */}
                    <div className="relative h-[55%] shrink-0 overflow-hidden">
                      <img
                        src={v.image}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-midnight/30 via-transparent to-midnight/90" />
                      {/* Number badge */}
                      <span aria-hidden className="absolute right-3 top-3 font-display text-5xl font-black leading-none text-white/20">
                        {pad(i + 1)}
                      </span>
                      {/* Icon chip floating over image */}
                      <span
                        className={cn(
                          'absolute bottom-0 left-5 translate-y-1/2 inline-flex size-14 items-center justify-center rounded-2xl ring-2 transition-all duration-700',
                          i === active ? 'bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_12px_28px_-8px_rgb(0_185_154/0.8)] ring-emerald/40' : 'bg-midnight text-emerald ring-silver/20',
                        )}
                      >
                        <v.icon className="size-6" aria-hidden />
                      </span>
                    </div>
                    {/* Text content */}
                    <div className={cn('relative flex flex-1 flex-col p-6 pt-10', i === active ? 'bg-[linear-gradient(160deg,#0b4c93_0%,#073b75_60%,#06172f_100%)]' : 'bg-midnight/90')}>
                      <Texture variant="lines" className="opacity-30" />
                      <h3 className="relative font-display text-xl font-bold text-white">{v.title}</h3>
                      <p className="relative mt-2 text-sm leading-relaxed text-steel-300">{v.desc}</p>
                    </div>
                    <span aria-hidden className={cn('absolute inset-x-0 bottom-0 h-1 origin-left bg-gradient-to-r from-emerald via-electric to-royal transition-transform duration-700', i === active ? 'scale-x-100' : 'scale-x-0')} />
                  </article>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}

function ValuesGrid() {
  return (
    <AnimatedSection id="values" className="relative scroll-mt-32 overflow-hidden bg-deep py-24 md:py-32">
      <Texture variant="grid" />
      <Container className="relative">
        <SectionHeading index="05" eyebrow="Core values" title={<>Principles that hold <em>under pressure</em>.</>} />
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <Tilt3D key={v.title} max={10} lift={16} className="h-full rounded-[1.75rem]" wrapperClassName="h-full">
              <article className="relative h-full overflow-hidden rounded-[1.75rem] bg-midnight/70 ring-1 ring-silver/10 transition-colors duration-500 group-hover/tilt:ring-emerald/40">
                {/* Photo header */}
                <div className="relative h-44 overflow-hidden">
                  <img src={v.image} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/tilt:scale-105" />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-midnight/20 to-midnight/80" />
                  <span aria-hidden className="absolute right-4 top-3 font-display text-5xl font-black text-white/20">{pad(i + 1)}</span>
                </div>
                {/* Content */}
                <div className="relative p-7 pt-4 transition-colors duration-500 group-hover/tilt:bg-royal/40">
                  <span className="inline-flex size-14 -translate-y-7 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_12px_24px_-8px_rgb(0_185_154/0.6)] transition-transform duration-500 [transform:translateZ(40px)] group-hover/tilt:[transform:translateZ(70px)_rotateY(360deg)]">
                    <v.icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="-mt-3 font-display text-xl font-semibold text-white">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel-400">{v.detail}</p>
                </div>
              </article>
            </Tilt3D>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  )
}

/* ----------------------------------------------------------------------------
 * How we work: a horizontal 3D coverflow of the four delivery steps that
 * travels as you scroll, with a progress rail and a moving marker.
 * Phones, tablets and reduced motion get a vertical timeline instead.
 * ------------------------------------------------------------------------- */

export function HowWeWork() {
  const reduced = usePrefersReducedMotion()
  const desktop = useMediaQuery('(min-width: 1024px)')
  return desktop && !reduced ? <ProcessScroller /> : <ProcessList />
}

function StepCard({ s, i, active }: { s: (typeof STEPS)[number]; i: number; active: boolean }) {
  return (
    <article
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-[2rem] p-9 ring-1 transition-[background-color,box-shadow] duration-700',
        active ? 'bg-[linear-gradient(150deg,#0b4c93_0%,#073b75_50%,#06172f_100%)] shadow-[0_50px_90px_-40px_rgb(0_185_154/0.45)] ring-emerald/40' : 'bg-midnight/80 ring-silver/10',
      )}
    >
      <Texture variant="lines" className="opacity-40" />
      <span aria-hidden className="absolute -bottom-10 -right-2 font-display text-[12rem] font-black leading-none text-transparent [-webkit-text-stroke:1.5px_rgb(197_206_216/0.14)]">
        {pad(i + 1)}
      </span>
      <div className="relative flex items-center justify-between">
        <span className={cn('inline-flex size-16 items-center justify-center rounded-2xl transition-all duration-700', active ? 'bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_18px_36px_-12px_rgb(0_185_154/0.8)]' : 'bg-white/5 text-emerald')}>
          <s.icon className="size-7" aria-hidden />
        </span>
        <span className="label-tech text-steel-400">Step {pad(i + 1)}</span>
      </div>
      <h3 className="relative mt-8 font-display text-4xl font-bold text-white">{s.step}</h3>
      <p className="relative mt-4 max-w-md leading-relaxed text-steel-300">{s.desc}</p>
      <ul className="relative mt-auto grid gap-2 pt-8">
        {s.points.map((p) => (
          <li key={p} className="flex items-center gap-3 text-sm text-steel-200">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald/15 text-emerald">
              <Check className="size-3.5" aria-hidden />
            </span>
            {p}
          </li>
        ))}
      </ul>
    </article>
  )
}

function ProcessScroller() {
  const ref = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const fillRef = useRef<HTMLSpanElement>(null)
  const markerRef = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(0)
  const N = STEPS.length

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const track = trackRef.current
          if (!track) return
          const p = self.progress
          const travel = Math.max(0, track.scrollWidth - window.innerWidth)
          track.style.transform = `translate3d(${(-p * travel).toFixed(1)}px,0,0)`
          const mid = window.innerWidth / 2
          let nearest = 0
          let best = Infinity
          cardRefs.current.forEach((el, i) => {
            if (!el) return
            const r = el.getBoundingClientRect()
            const d = Math.max(-1, Math.min(1, (r.left + r.width / 2 - mid) / window.innerWidth))
            if (Math.abs(d) < best) {
              best = Math.abs(d)
              nearest = i
            }
            el.style.transform = `rotateY(${(-d * 28).toFixed(2)}deg) scale(${(1 - Math.abs(d) * 0.12).toFixed(3)})`
            el.style.opacity = (1 - Math.abs(d) * 0.55).toFixed(3)
          })
          if (fillRef.current) fillRef.current.style.transform = `scaleX(${p.toFixed(4)})`
          if (markerRef.current) markerRef.current.style.left = `${(p * 100).toFixed(2)}%`
          setActive((prev) => (prev === nearest ? prev : nearest))
        },
      })
      st.refresh()
      return () => st.kill()
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="process" className="relative" style={{ height: `${N * 75 + 100}svh` }} aria-label="How we work">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pb-6 pt-32">
        <Texture variant="glow" />
        <Container className="relative flex items-end justify-between gap-10">
          <SectionHeading reveal={false} index="06" eyebrow="How we work" title={<>A delivery rhythm you can <em>plan around</em>.</>} />
          <div className="hidden shrink-0 text-right lg:block">
            <p className="font-display text-7xl font-black leading-none text-white">
              <span key={active} className="inline-block animate-[rise_.5s_var(--ease-out-expo)]">{pad(active + 1)}</span>
              <span className="text-3xl text-steel-500"> / {pad(N)}</span>
            </p>
            <p className="mt-2 label-tech text-emerald">{STEPS[active]!.step}</p>
          </div>
        </Container>

        <div className="relative mt-8 [perspective:1800px]">
          <div ref={trackRef} className="flex w-max gap-8 px-[max(1.5rem,calc((100vw-80rem)/2+3rem))] will-change-transform">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                className="h-[23rem] w-[min(34rem,44vw)] shrink-0 will-change-transform"
              >
                <StepCard s={s} i={i} active={i === active} />
              </div>
            ))}
            <div className="flex h-[23rem] w-[min(26rem,34vw)] shrink-0 flex-col justify-center rounded-[2rem] border border-dashed border-silver/20 p-9">
              <p className="label-tech text-emerald">Ready when you are</p>
              <p className="mt-4 font-display text-3xl font-bold text-white">Start with a conversation about your scope.</p>
              <Link to="/contact" className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-emerald to-teal-500 px-6 py-3 text-sm font-semibold text-midnight transition hover:shadow-[0_16px_30px_-12px_rgb(0_185_154/0.8)]">
                Talk to our team <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        <Container className="relative mt-8">
          <div className="relative h-1 rounded-full bg-silver/10">
            <span ref={fillRef} className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-emerald via-electric to-royal" style={{ transform: 'scaleX(0)' }} />
            {STEPS.map((s, i) => (
              <span
                key={s.step}
                className={cn('absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-500', i <= active ? 'border-emerald bg-emerald' : 'border-silver/30 bg-midnight')}
                style={{ left: `${(i / (N - 1)) * 100}%` }}
              />
            ))}
            <span ref={markerRef} className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_6px_rgb(0_185_154/0.25),0_0_24px_rgb(0_185_154/0.8)]" style={{ left: '0%' }} />
          </div>
          <div className="mt-4 flex justify-between label-tech text-steel-500">
            {STEPS.map((s, i) => (
              <span key={s.step} className={cn('transition-colors', i <= active && 'text-white')}>
                {s.step}
              </span>
            ))}
          </div>
        </Container>
      </div>
    </section>
  )
}

function ProcessList() {
  return (
    <AnimatedSection id="process" className="relative scroll-mt-32 overflow-hidden py-24">
      <Texture variant="glow" />
      <Container className="relative">
        <SectionHeading index="06" eyebrow="How we work" title={<>A delivery rhythm you can <em>plan around</em>.</>} />
        <ol className="relative mt-14 space-y-6 border-l border-emerald/30 pl-6">
          {STEPS.map((s, i) => (
            <li key={s.step} className="relative">
              <span className="absolute -left-[2.15rem] top-8 size-4 rounded-full border-2 border-emerald bg-midnight" aria-hidden />
              <StepCard s={s} i={i} active />
            </li>
          ))}
        </ol>
      </Container>
    </AnimatedSection>
  )
}

/* ----------------------------------------------------------------------------
 * FAQ: topic filters, a question index and a large answer panel that tilts
 * in 3D. On phones each answer opens under its question.
 * ------------------------------------------------------------------------- */

export function AboutFaq({
  items,
  index = '12',
  title = <>Questions we <em>often</em> hear.</>,
  lead = 'Straight answers on how we work, where we work and what you receive at the end of a scope.',
  askHref = '/contact',
  moreHref,
}: {
  items: FaqItem[]
  index?: string
  title?: ReactNode
  lead?: string
  /** Where "Ask our team" points. */
  askHref?: string
  /** Optional link to the full FAQs page. */
  moreHref?: string
}) {
  const topics = useMemo(() => ['All', ...new Set(items.map((i) => i.topic ?? 'General'))], [items])
  const [topic, setTopic] = useState('All')
  const [open, setOpen] = useState(0)
  const shown = items.map((it, i) => ({ ...it, i })).filter((it) => topic === 'All' || it.topic === topic)
  const current = items[open] ?? items[0]!
  const TopicIcon = current.topic === 'Projects' ? Building2 : current.topic === 'Safety & quality' ? ShieldCheck : MessageCircleQuestion

  return (
    <AnimatedSection id="faq" className="relative scroll-mt-32 overflow-hidden bg-deep py-24 md:py-32">
      <Texture variant="grid" />
      <div aria-hidden className="absolute -left-40 top-20 size-[36rem] rounded-full bg-electric/10 blur-3xl" />
      <div aria-hidden className="absolute -right-40 bottom-0 size-[30rem] rounded-full bg-emerald/10 blur-3xl" />
      <Container className="relative">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading index={index} eyebrow="Frequently asked" title={title} lead={lead} />
          {topics.length <= 2 ? (
            moreHref && (
              <Link to={moreHref} className="reveal link-underline inline-flex shrink-0 items-center gap-2 font-semibold text-white">
                See all FAQs <ArrowRight className="size-4" aria-hidden />
              </Link>
            )
          ) : (
          <div className="reveal flex flex-wrap gap-2" role="tablist" aria-label="Filter questions by topic">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={t === topic}
                onClick={() => {
                  setTopic(t)
                  const first = items.findIndex((it) => t === 'All' || it.topic === t)
                  if (first >= 0) setOpen(first)
                }}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition duration-300',
                  t === topic ? 'bg-gradient-to-r from-emerald to-teal-500 text-midnight shadow-[0_12px_24px_-12px_rgb(0_185_154/0.8)]' : 'border border-silver/15 text-steel-300 hover:border-emerald/50 hover:text-white',
                )}
              >
                {t}
              </button>
            ))}
          </div>
          )}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          <ol className="grid content-start gap-3">
            {shown.map((it) => {
              const on = it.i === open
              return (
                <li key={it.q} className="reveal [perspective:1000px]">
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => setOpen(it.i)}
                    onMouseEnter={() => window.matchMedia('(min-width: 1024px)').matches && setOpen(it.i)}
                    className={cn(
                      'group flex w-full items-center gap-4 rounded-2xl p-5 text-left ring-1 transition-all duration-500 ease-[var(--ease-out-expo)]',
                      on ? 'bg-royal/60 ring-emerald/40 [transform:translateZ(20px)]' : 'bg-white/[0.03] ring-white/5 hover:bg-white/[0.06] hover:[transform:rotateX(6deg)_translateY(-3px)]',
                    )}
                  >
                    <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs transition-all duration-500', on ? 'bg-gradient-to-br from-emerald to-electric text-white' : 'bg-white/5 text-steel-400')}>
                      {pad(it.i + 1)}
                    </span>
                    <span className="flex-1">
                      <span className="block label-tech text-steel-500">{it.topic}</span>
                      <span className={cn('mt-1 block font-display text-lg font-semibold leading-snug transition-colors', on ? 'text-white' : 'text-steel-200 group-hover:text-white')}>{it.q}</span>
                    </span>
                    <span className={cn('inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-500', on ? 'bg-emerald text-midnight lg:rotate-0' : 'bg-white/5 text-steel-300')}>
                      <ArrowRight className={cn('hidden size-4 lg:block', on && 'translate-x-0.5')} aria-hidden />
                      <Plus className={cn('size-4 transition-transform lg:hidden', on && 'rotate-45')} aria-hidden />
                    </span>
                  </button>
                  {on && <p className="px-5 pb-2 pt-4 leading-relaxed text-steel-300 lg:hidden">{it.a}</p>}
                </li>
              )
            })}
          </ol>

          <div className="hidden lg:block">
            <div className="sticky top-36">
              <Tilt3D max={6} lift={18} className="rounded-[2rem]">
                <div className="relative isolate min-h-[24rem] overflow-hidden rounded-[2rem] border-metallic surface-metal p-10">
                  <Texture variant="lines" />
                  <span aria-hidden className="pointer-events-none absolute -right-2 -top-10 font-serif text-[16rem] italic leading-none text-metallic opacity-25 [transform:translateZ(30px)]">
                    ?
                  </span>
                  <div key={open} className="relative animate-[rise_.55s_var(--ease-out-expo)]">
                    <p className="flex items-center gap-3 [transform:translateZ(30px)]">
                      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-emerald/15 text-emerald ring-1 ring-emerald/30">
                        <TopicIcon className="size-5" aria-hidden />
                      </span>
                      <span className="label-tech text-emerald">
                        {current.topic} · Question {pad(open + 1)}
                      </span>
                    </p>
                    <h3 className="mt-8 font-display text-3xl font-bold leading-tight text-white [transform:translateZ(50px)]">{current.q}</h3>
                    <p className="mt-6 text-lg leading-relaxed text-steel-300 [transform:translateZ(25px)]">{current.a}</p>
                  </div>
                  <div className="relative mt-10 flex items-center justify-between border-t border-white/10 pt-6">
                    <span className="text-sm text-steel-400">Still have a question?</span>
                    <Link to={askHref} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-midnight transition hover:bg-emerald hover:text-white">
                      Ask our team <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </Tilt3D>
            </div>
          </div>
        </div>
      </Container>
    </AnimatedSection>
  )
}
