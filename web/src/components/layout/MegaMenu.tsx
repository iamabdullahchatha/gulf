import { useState, type ComponentType } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight, Check, FileText, HelpCircle, ShieldCheck } from 'lucide-react'
import { SERVICES, SERVICE_GROUPS, type Service } from '@/data/services'
import { INDUSTRIES, type Industry } from '@/data/industries'
import type { MegaKey } from '@/data/navigation'
import { cn } from '@/lib/cn'
import { Container } from '@/components/Container'

interface Props {
  active: MegaKey | null
  onNavigate: () => void
  /** Matches the floating glass header bar (rounded panel with a gap). */
  floating?: boolean
}

interface Item {
  key: string
  href: string
  index: string
  title: string
  short: string
  description: string
  points: string[]
  image: string
  icon: ComponentType<{ className?: string }>
}

interface Group {
  heading: string
  items: Item[]
}

const fromService = (s: Service): Item => ({ key: s.slug, href: `/services/${s.slug}`, index: s.index, title: s.title, short: s.short, description: s.description, points: s.highlights.slice(0, 3), image: s.innerImageSmall, icon: s.icon })
const fromIndustry = (i: Industry): Item => ({ key: i.slug, href: `/industries/${i.slug}`, index: i.index, title: i.title, short: i.short, description: i.description, points: i.context, image: i.innerImageSmall, icon: i.icon })
const pick = <T extends { slug: string }>(list: T[], slugs: string[]) => slugs.map((s) => list.find((x) => x.slug === s)).filter((x): x is T => Boolean(x))

const CONTENT: Record<MegaKey, { eyebrow: string; title: string; all: { label: string; href: string }; groups: Group[] }> = {
  services: {
    eyebrow: 'Services',
    title: 'Industrial capability across the full asset lifecycle',
    all: { label: 'All services', href: '/services' },
    groups: SERVICE_GROUPS.map((g) => ({ heading: g.heading, items: pick(SERVICES, g.slugs).map(fromService) })),
  },
  industries: {
    eyebrow: 'Industries',
    title: 'Trusted across every link of the energy value chain',
    all: { label: 'All industries', href: '/industries' },
    groups: [
      { heading: 'Energy', items: pick(INDUSTRIES, ['oil-gas', 'petrochemical']).map(fromIndustry) },
      { heading: 'Industrial', items: pick(INDUSTRIES, ['construction', 'mechanical-equipment']).map(fromIndustry) },
    ],
  },
}

const QUICK = [
  { icon: FileText, label: 'Request a proposal', href: '/contact' },
  { icon: ShieldCheck, label: 'HSE & quality', href: '/about#hse' },
  { icon: HelpCircle, label: 'FAQs', href: '/about#faq' },
]

/**
 * Mega menu. Grouped links on the left; a live preview on the right that
 * follows the hovered (or focused) item with its photograph, description
 * and key points. Rendered inside the header so moving from a trigger into
 * the panel never leaves the header hover region.
 */
export function MegaMenu({ active, onNavigate, floating = false }: Props) {
  return (
    <div
      className={cn(
        'absolute inset-x-0 top-full origin-top transition-[opacity,transform,visibility] duration-300 ease-[var(--ease-out-expo)]',
        floating ? 'px-3 pt-3 md:px-6' : '',
        active ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-2 scale-[0.99] opacity-0',
      )}
      role="region"
      aria-label={active ? `${CONTENT[active].eyebrow} menu` : undefined}
      aria-hidden={!active}
    >
      <div
        className={cn(
          'theme-light relative mx-auto overflow-hidden bg-white shadow-[0_50px_100px_-40px_rgb(9_38_75/0.55),0_8px_24px_-12px_rgb(9_38_75/0.15)]',
          floating ? 'max-w-7xl rounded-3xl ring-1 ring-royal/10' : 'border-y border-royal/10',
        )}
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald via-electric to-royal" />
        {active && <Panel key={active} menu={active} onNavigate={onNavigate} />}
      </div>
    </div>
  )
}

function Panel({ menu, onNavigate }: { menu: MegaKey; onNavigate: () => void }) {
  const content = CONTENT[menu]
  const all = content.groups.flatMap((g) => g.items)
  const [current, setCurrent] = useState<Item>(all[0]!)
  let n = 0

  return (
    <>
      <Container className="grid gap-10 py-9 lg:grid-cols-[1.65fr_1fr]">
        <div>
          <div className="flex items-end justify-between gap-6 border-b border-royal/10 pb-5">
            <div>
              <p className="label-tech text-teal-500">{content.eyebrow}</p>
              <p className="mt-1.5 font-display text-xl font-bold text-midnight">{content.title}</p>
            </div>
            <Link
              to={content.all.href}
              onClick={onNavigate}
              className="group hidden shrink-0 items-center gap-2 rounded-full border border-royal/15 px-4 py-2 text-sm font-semibold text-royal transition hover:border-royal hover:bg-royal hover:text-white md:inline-flex"
            >
              {content.all.label} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>

          <div className={cn('mt-6 grid gap-x-6 gap-y-6', content.groups.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
            {content.groups.map((g) => (
              <div key={g.heading}>
                <p className="mb-2 flex items-center gap-2 label-tech text-steel-500">
                  <span className="h-px w-4 bg-emerald" aria-hidden /> {g.heading}
                </p>
                <ul className="space-y-1">
                  {g.items.map((item) => {
                    const Icon = item.icon
                    const on = current.key === item.key
                    const delay = n++ * 45
                    return (
                      <li key={item.key} className="animate-[rise_.55s_var(--ease-out-expo)_both]" style={{ animationDelay: `${delay}ms` }}>
                        <Link
                          to={item.href}
                          onClick={onNavigate}
                          onMouseEnter={() => setCurrent(item)}
                          onFocus={() => setCurrent(item)}
                          className={cn(
                            'group flex items-start gap-3.5 rounded-2xl p-3 transition-all duration-300',
                            on ? 'bg-paper shadow-[inset_0_0_0_1px_rgb(8_126_219/0.15)]' : 'hover:bg-paper',
                          )}
                        >
                          <span
                            className={cn(
                              'inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
                              on ? 'bg-gradient-to-br from-electric to-royal text-white shadow-[0_10px_20px_-10px_rgb(8_126_219/0.85)]' : 'bg-electric/[0.08] text-royal',
                            )}
                          >
                            <Icon className="size-[1.1rem]" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={cn('flex items-center gap-1.5 font-semibold leading-snug transition-colors', on ? 'text-royal' : 'text-midnight')}>
                              {item.title}
                              <ArrowRight className={cn('size-3.5 shrink-0 transition-all duration-300', on ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0')} aria-hidden />
                            </span>
                            <span className="mt-0.5 block text-[0.8125rem] leading-snug text-steel-500">{item.short}</span>
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <Link
          to={current.href}
          onClick={onNavigate}
          className="group relative isolate hidden min-h-[22rem] overflow-hidden rounded-[1.5rem] shadow-[0_30px_60px_-30px_rgb(9_38_75/0.6)] lg:flex lg:flex-col lg:justify-end"
        >
          {all.map((item) => (
            <img
              key={item.key}
              src={item.image}
              alt=""
              loading="eager"
              className={cn(
                'absolute inset-0 -z-10 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]',
                item.key === current.key ? 'scale-100 opacity-100' : 'scale-105 opacity-0',
              )}
            />
          ))}
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/60 via-50% to-midnight/5" />
          <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 label-tech text-royal backdrop-blur">
            {content.eyebrow.replace(/s$/, '').replace(/ie$/, 'y')} {current.index}
          </span>
          <div key={current.key} className="animate-[rise_.5s_var(--ease-out-expo)_both] p-6">
            <p className="font-display text-2xl font-bold text-white">{current.title}</p>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/80">{current.description}</p>
            <ul className="mt-4 space-y-1.5">
              {current.points.slice(0, 3).map((p) => (
                <li key={p} className="flex items-start gap-2 text-[0.8125rem] text-white/90">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-emerald" aria-hidden /> {p}
                </li>
              ))}
            </ul>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-midnight transition group-hover:bg-emerald group-hover:text-white">
              View details <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </div>
        </Link>
      </Container>

      {/* Quick links */}
      <div className="border-t border-royal/10 bg-paper/80">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-3.5">
          <p className="text-sm text-steel-700">Need several disciplines under one point of accountability?</p>
          <ul className="flex flex-wrap items-center gap-2">
            {QUICK.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <Link
                  to={href}
                  onClick={onNavigate}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition',
                    href === '/contact' ? 'bg-midnight text-white hover:bg-electric' : 'text-royal hover:bg-white hover:shadow-sm',
                  )}
                >
                  <Icon className="size-4" aria-hidden /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </>
  )
}
