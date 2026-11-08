import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { Container } from '@/components/Container'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { cn } from '@/lib/cn'
import { Picture } from '@/components/Picture'

type Tone = 'dark' | 'light'

/**
 * Sticky "on this page" bar that follows the hero on long inner pages. The
 * pill for the section in view is highlighted and kept scrolled into sight.
 */
export function PageNav({ items, label = 'On this page' }: { items: { id: string; label: string }[]; label?: string }) {
  const [active, setActive] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = items.map((it) => document.getElementById(it.id)).filter((el): el is HTMLElement => Boolean(el))
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-35% 0px -55% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [items])

  useEffect(() => {
    const bar = barRef.current
    const pill = active ? bar?.querySelector<HTMLElement>(`[data-nav="${active}"]`) : null
    if (bar && pill) bar.scrollTo({ left: pill.offsetLeft - bar.clientWidth / 2 + pill.clientWidth / 2, behavior: 'smooth' })
  }, [active])

  return (
    <nav aria-label={label} className="sticky top-[4.5rem] z-30 border-y border-silver/10 glass-dark">
      <Container>
        <div ref={barRef} className="flex items-center gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          <span className="mr-2 hidden shrink-0 label-tech text-steel-500 md:inline">{label}</span>
          {items.map((it, i) => {
            const on = it.id === active
            return (
              <a
                key={it.id}
                data-nav={it.id}
                href={`#${it.id}`}
                aria-current={on ? 'location' : undefined}
                className={cn(
                  'group flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition duration-300',
                  on ? 'border-emerald/60 bg-emerald/15 text-white shadow-[0_8px_24px_-12px_rgb(0_185_154/0.8)]' : 'border-silver/10 text-steel-300 hover:border-emerald/50 hover:text-white',
                )}
              >
                <span className={cn('label-tech transition-colors', on ? 'text-emerald' : 'text-steel-500 group-hover:text-emerald')}>{String(i + 1).padStart(2, '0')}</span>
                {it.label}
              </a>
            )
          })}
        </div>
      </Container>
    </nav>
  )
}

interface MediaLinkCardProps {
  href: string
  image: string
  eyebrow: string
  title: string
  text?: string
  icon?: ComponentType<{ className?: string }>
  className?: string
  aspect?: string
}

/** Photographic link card with a 3D tilt, used for related services and industries. */
export function MediaLinkCard({ href, image, eyebrow, title, text, icon: Icon, className, aspect = 'aspect-[4/5]' }: MediaLinkCardProps) {
  return (
    <Tilt3D max={7} lift={14} className="rounded-[1.75rem]" wrapperClassName={cn('h-full', className)}>
      <Link
        to={href}
        className={cn('group relative flex h-full flex-col justify-end overflow-hidden rounded-[1.75rem] p-6 shadow-[0_30px_60px_-30px_rgb(3_13_29/0.75)] ring-1 ring-white/10 md:p-7', aspect)}
      >
        <Picture src={image} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-105" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/55 to-midnight/5" />
        <span className="absolute right-5 top-5 inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-midnight backdrop-blur transition group-hover:bg-emerald group-hover:text-white [transform:translateZ(30px)]">
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
        <div className="[transform:translateZ(40px)]">
          <span className="flex items-center gap-2 label-tech text-white/90 drop-shadow-[0_1px_6px_rgb(3_13_29/0.8)] [&_svg]:text-teal-300">
            {Icon && <Icon className="size-4" aria-hidden />} {eyebrow}
          </span>
          <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-white">{title}</h3>
          {text && <p className="mt-2 text-sm leading-relaxed text-white/80">{text}</p>}
        </div>
      </Link>
    </Tilt3D>
  )
}

/** Numbered execution steps as tilting 3D cards joined by a glowing rail. */
export function ProcessSteps({ steps, tone = 'dark' }: { steps: { title: string; desc: string }[]; tone?: Tone }) {
  const light = tone === 'light'
  return (
    <ol className={cn('relative mt-16 grid gap-6', steps.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3')}>
      <span aria-hidden className={cn('absolute left-8 right-8 top-[3.25rem] hidden h-px bg-gradient-to-r from-emerald via-electric lg:block', light ? 'to-royal/10' : 'to-silver/10')} />
      {steps.map((s, i) => (
        <li key={s.title} className="reveal relative">
          <Tilt3D max={9} lift={16} className="h-full rounded-[1.75rem]" wrapperClassName="h-full">
            <div
              className={cn(
                'relative h-full overflow-hidden rounded-[1.75rem] p-7 pt-8 ring-1 transition duration-500',
                light
                  ? 'bg-white ring-royal/10 shadow-[0_30px_60px_-44px_rgb(9_38_75/0.6)] group-hover/tilt:shadow-[0_50px_80px_-40px_rgb(8_126_219/0.45)]'
                  : 'bg-[linear-gradient(165deg,rgb(11_76_147/0.45),rgb(6_23_47/0.85))] ring-silver/10 group-hover/tilt:ring-emerald/40',
              )}
            >
              <span aria-hidden className={cn('absolute -right-2 -top-6 font-display text-[7rem] font-black leading-none', light ? 'text-royal/[0.05]' : 'text-white/[0.04]')}>{String(i + 1).padStart(2, '0')}</span>
              <span
                className={cn(
                  'relative z-10 inline-flex size-12 items-center justify-center rounded-full font-mono text-sm font-semibold transition-transform duration-700 ease-[var(--ease-out-expo)] [transform:translateZ(50px)] group-hover/tilt:[transform:translateZ(80px)_scale(1.08)]',
                  'bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_14px_30px_-10px_rgb(0_185_154/0.8)]',
                )}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={cn('relative mt-6 font-display text-2xl font-bold [transform:translateZ(30px)]', light ? 'text-midnight' : 'text-white')}>{s.title}</h3>
              <p className={cn('relative mt-3 text-sm leading-relaxed', light ? 'text-steel-700' : 'text-steel-400')}>{s.desc}</p>
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-emerald via-electric to-royal transition-transform duration-700 group-hover/tilt:scale-x-100" />
            </div>
          </Tilt3D>
        </li>
      ))}
    </ol>
  )
}

/** Two-column checklist of short capability statements. */
export function CheckList({ items, tone = 'dark', className }: { items: string[]; tone?: Tone; className?: string }) {
  const light = tone === 'light'
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {items.map((it) => (
        <li
          key={it}
          className={cn(
            'reveal flex items-start gap-3 rounded-2xl p-4 transition duration-300 hover:-translate-y-0.5',
            light ? 'bg-white ring-1 ring-royal/10 shadow-[0_14px_30px_-24px_rgb(9_38_75/0.5)]' : 'glass',
          )}
        >
          <span className={cn('mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full', light ? 'bg-teal-500/10 text-teal-500' : 'bg-emerald/15 text-emerald')}>
            <Check className="size-3.5" aria-hidden />
          </span>
          <span className={cn('text-[0.9375rem] font-medium leading-snug', light ? 'text-midnight' : 'text-steel-200')}>{it}</span>
        </li>
      ))}
    </ul>
  )
}

/** Numbered cards for scope items and focus areas. */
export function ScopeGrid({ items, tone = 'light', icon: Icon }: { items: { title: string; desc: string }[]; tone?: Tone; icon?: ComponentType<{ className?: string }> }) {
  const light = tone === 'light'
  return (
    <ul className={cn('mt-14 grid gap-5 [perspective:1400px] sm:grid-cols-2', items.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
      {items.map((it, i) => (
        <li
          key={it.title}
          className={cn(
            'reveal group relative overflow-hidden rounded-[1.5rem] p-7 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:[transform:translateY(-6px)_rotateX(4deg)]',
            light
              ? 'bg-white ring-1 ring-royal/10 shadow-[0_20px_44px_-34px_rgb(9_38_75/0.55)] hover:shadow-[0_34px_60px_-30px_rgb(9_38_75/0.45)]'
              : 'glass hover:shadow-[0_34px_60px_-30px_rgb(0_0_0/0.6)]',
          )}
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-emerald via-electric to-royal transition-transform duration-500 group-hover:scale-x-100" />
          <div className="flex items-center justify-between">
            <span className={cn('font-display text-4xl font-black', light ? 'text-royal/15' : 'text-metallic opacity-70')}>{String(i + 1).padStart(2, '0')}</span>
            {Icon && <Icon className={cn('size-5', light ? 'text-teal-500' : 'text-emerald')} />}
          </div>
          <h3 className={cn('mt-6 font-display text-xl font-semibold', light ? 'text-midnight' : 'text-white')}>{it.title}</h3>
          <p className={cn('mt-2 text-sm leading-relaxed', light ? 'text-steel-700' : 'text-steel-400')}>{it.desc}</p>
        </li>
      ))}
    </ul>
  )
}

interface SplitFeatureProps {
  id?: string
  index: string
  eyebrow: string
  title: ReactNode
  body: string[]
  points?: string[]
  image: string
  imageSmall?: string
  imageAlt: string
  caption?: string
  link?: { label: string; href: string }
  reverse?: boolean
  tone?: Tone
  className?: string
  /** Small card floating in front of the photo on hover. */
  chip?: { label: string; value: string }
}

/** Photograph beside editorial copy, used for capability chapters. */
export function SplitFeature({ id, index, eyebrow, title, body, points, image, imageSmall, imageAlt, caption, link, reverse, tone = 'dark', className, chip }: SplitFeatureProps) {
  const light = tone === 'light'
  return (
    <div id={id} className={cn('grid scroll-mt-32 items-center gap-12 lg:grid-cols-2 lg:gap-20', className)}>
      <Tilt3D max={5} lift={12} className="rounded-[2rem]" wrapperClassName={cn('reveal', reverse && 'lg:order-2')}>
        <figure className="relative overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-36px_rgb(3_13_29/0.7)] ring-1 ring-white/10">
          <Picture small={imageSmall} src={image} alt={imageAlt} loading="lazy" data-parallax className="aspect-[4/3] w-full scale-[1.14] object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent" />
          {caption && (
            <figcaption className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-midnight backdrop-blur [transform:translateZ(40px)]">{caption}</figcaption>
          )}
        </figure>
        {chip && (
          <div className={cn('absolute -bottom-6 hidden rounded-2xl bg-white p-4 shadow-[0_24px_50px_-20px_rgb(3_13_29/0.6)] ring-1 ring-royal/10 transition-transform duration-500 [transform:translateZ(70px)] group-hover/tilt:[transform:translateZ(110px)] sm:block', reverse ? '-left-5' : '-right-5')}>
            <p className="label-tech text-teal-500">{chip.label}</p>
            <p className="mt-1 font-display text-lg font-bold text-midnight">{chip.value}</p>
          </div>
        )}
      </Tilt3D>
      <div>
        <p className="reveal flex items-center gap-3">
          <span className={cn('label-tech', light ? 'text-teal-500' : 'text-emerald')}>{index}</span>
          <span className="h-px w-8 bg-gradient-to-r from-emerald to-transparent" aria-hidden />
          <span className={cn('font-display font-expanded text-[0.72rem] font-semibold uppercase tracking-[0.26em]', light ? 'text-royal' : 'text-silver')}>{eyebrow}</span>
        </p>
        <h2 className={cn('reveal mt-5 text-display-md font-bold', light ? 'text-midnight' : 'text-white')}>{title}</h2>
        {body.map((p) => (
          <p key={p} className={cn('reveal mt-5 leading-relaxed md:text-lg', light ? 'text-steel-700' : 'text-steel-400')}>{p}</p>
        ))}
        {points && (
          <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {points.map((pt) => (
              <li key={pt} className={cn('reveal flex items-start gap-2.5 text-sm', light ? 'text-midnight' : 'text-steel-200')}>
                <Check className={cn('mt-0.5 size-4 shrink-0', light ? 'text-teal-500' : 'text-emerald')} aria-hidden /> {pt}
              </li>
            ))}
          </ul>
        )}
        {link && (
          <Link to={link.href} className={cn('reveal link-underline mt-9 inline-flex items-center gap-2 font-semibold', light ? 'text-royal' : 'text-white')}>
            {link.label} <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  )
}

interface PagerLink {
  href: string
  title: string
  /** Optional photograph; without one the card is typographic. */
  image?: string
  icon?: ComponentType<{ className?: string }>
  index?: string
}

/** Previous / next pager between sibling detail pages. */
export function SiblingPager({ prev, next, kind }: { prev: PagerLink; next: PagerLink; kind: string }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {[
        { ...prev, label: `Previous ${kind}`, align: 'items-start text-left', right: false },
        { ...next, label: `Next ${kind}`, align: 'items-end text-right', right: true },
      ].map((p) => {
        const Icon = p.icon
        return (
          <Tilt3D key={p.label} max={5} lift={12} className="h-full rounded-[1.75rem]" wrapperClassName="h-full">
            <Link
              to={p.href}
              className={cn(
                'group relative flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-[1.75rem] border-metallic p-8',
                !p.image && 'bg-[linear-gradient(150deg,#0b4c93_0%,#073b75_45%,#06172f_100%)]',
                p.align,
              )}
            >
              {p.image ? (
                <>
                  <Picture src={p.image} alt="" loading="lazy" className="img-cinematic absolute inset-0 -z-10 h-full w-full object-cover transition duration-[1200ms] group-hover:scale-105" />
                  <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/70 to-midnight/20" />
                </>
              ) : (
                <>
                  <div aria-hidden className="absolute -bottom-20 left-1/2 size-56 -translate-x-1/2 rounded-full bg-emerald/15 blur-3xl transition-opacity duration-700 group-hover:opacity-100 opacity-50" />
                  {Icon && (
                    <span className={cn('absolute top-8 inline-flex size-12 items-center justify-center rounded-2xl bg-white/10 text-emerald ring-1 ring-white/15 transition-transform duration-700 [transform:translateZ(40px)] group-hover:[transform:translateZ(60px)_rotate(-8deg)]', p.right ? 'right-8' : 'left-8')}>
                      <Icon className="size-5" aria-hidden />
                    </span>
                  )}
                </>
              )}
              <span className={cn('relative flex items-center gap-3', p.right && 'flex-row-reverse')}>
                <span className="label-tech text-emerald">{p.label}</span>
                {p.index && <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[0.7rem] text-white/80 ring-1 ring-white/15">{p.index}</span>}
              </span>
              <span className={cn('relative mt-3 flex items-center gap-3 font-display text-2xl font-bold text-white md:text-3xl [transform:translateZ(30px)]', p.right && 'flex-row-reverse')}>
                {p.right ? <ArrowRight className="size-6 shrink-0 transition group-hover:translate-x-2" aria-hidden /> : <ArrowRight className="size-6 shrink-0 rotate-180 transition group-hover:-translate-x-2" aria-hidden />}
                {p.title}
              </span>
            </Link>
          </Tilt3D>
        )
      })}
    </div>
  )
}
