import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronsDownUp,
  ChevronsUpDown,
  Factory,
  Handshake,
  Layers,
  Link2,
  Mail,
  MessageSquareText,
  Plus,
  Quote,
  Search,
  SearchX,
  ShieldCheck,
  X,
} from 'lucide-react'
import { COMPANY } from '@/data/company'
import { Container } from '@/components/Container'
import { Texture } from '@/components/Texture'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { cn } from '@/lib/cn'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { buttonStyles } from '@/lib/buttonStyles'
import { FAQ_CATALOG, FAQ_CATEGORIES, type CatalogFaq, type FaqCategoryKey } from '@/data/faqCatalog'

type Icon = ComponentType<{ className?: string }>

const CATEGORY_ICON: Record<FaqCategoryKey, Icon> = {
  company: Building2,
  working: Handshake,
  enquiries: MessageSquareText,
  safety: ShieldCheck,
  services: Layers,
  industries: Factory,
}

const pad = (n: number) => String(n).padStart(2, '0')
const categoryTitle = (k: FaqCategoryKey) => FAQ_CATEGORIES.find((c) => c.key === k)?.title ?? ''

function matches(f: CatalogFaq, query: string): boolean {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!tokens.length) return true
  const hay = `${f.q} ${f.a} ${f.group ?? ''} ${categoryTitle(f.category)}`.toLowerCase()
  return tokens.every((t) => hay.includes(t))
}

/** Wraps every occurrence of the query words in a highlight. */
function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = query.split(/\s+/).filter((t) => t.length > 1)
  if (!tokens.length) return <>{text}</>
  const re = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-emerald/25 text-inherit">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

/* ----------------------------------------------------------------------------
 * Hero carousel: featured questions on a 3D ring that turns slowly by itself,
 * pauses under the pointer and leans toward it. Picking a card opens that
 * answer below. Phones and reduced motion get a swipeable row instead.
 * ------------------------------------------------------------------------- */

export function QuestionCarousel({ items, onPick }: { items: CatalogFaq[]; onPick: (id: string) => void }) {
  const reduced = usePrefersReducedMotion()
  const desktop = useMediaQuery('(min-width: 1024px)')
  return desktop && !reduced ? <Ring items={items} onPick={onPick} /> : <Row items={items} onPick={onPick} />
}

function QuestionCard({ f, onPick, className }: { f: CatalogFaq; onPick: (id: string) => void; className?: string }) {
  const Icon = CATEGORY_ICON[f.category]
  return (
    <button
      type="button"
      onClick={() => onPick(f.id)}
      className={cn(
        'group relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/15 bg-[linear-gradient(160deg,rgb(11_76_147/0.75),rgb(6_23_47/0.92))] p-6 text-left shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)] backdrop-blur-xl',
        className,
      )}
    >
      <Quote aria-hidden className="absolute -right-3 -top-3 size-28 rotate-180 text-white/[0.05]" />
      <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3 py-1.5 label-tech text-emerald ring-1 ring-white/10">
        <Icon className="size-3.5" aria-hidden /> {f.group ?? categoryTitle(f.category)}
      </span>
      <span className="mt-5 font-display text-xl font-bold leading-snug text-white">{f.q}</span>
      <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-teal-300 transition group-hover:text-white">
        Read the answer <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
      </span>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald via-electric to-royal opacity-70" />
    </button>
  )
}

function Ring({ items, onPick }: { items: CatalogFaq[]; onPick: (id: string) => void }) {
  const ringRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const angle = useRef(0)
  const paused = useRef(false)
  const pointer = useRef({ x: 0, y: 0 })
  const N = items.length
  const STEP = 360 / N
  const R = 430

  useEffect(() => {
    let raf = 0
    const tick = () => {
      if (!paused.current) angle.current = (angle.current + 0.07) % 360
      const ring = ringRef.current
      if (ring) {
        const { x, y } = pointer.current
        ring.style.transform = `translateZ(${-R}px) rotateX(${(-7 + y * 8).toFixed(2)}deg) rotateY(${(-angle.current + x * 14).toFixed(2)}deg)`
      }
      cardRefs.current.forEach((el, i) => {
        if (!el) return
        const rel = ((((i * STEP - angle.current) % 360) + 540) % 360) - 180
        const facing = Math.max(0, Math.cos((rel * Math.PI) / 180))
        el.style.opacity = (0.12 + 0.88 * facing ** 1.8).toFixed(3)
        el.style.filter = `brightness(${(0.5 + 0.5 * facing).toFixed(3)})`
        el.style.pointerEvents = facing > 0.75 ? 'auto' : 'none'
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [STEP])

  return (
    <div
      className="relative h-[30rem] [perspective:1700px] lg:max-xl:scale-[0.8]"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => {
        paused.current = false
        pointer.current = { x: 0, y: 0 }
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        pointer.current = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }
      }}
    >
      <div aria-hidden className="absolute left-1/2 top-[62%] h-[16rem] w-[46rem] -translate-x-1/2 rounded-[50%] border border-emerald/20 [transform:rotateX(76deg)]" />
      <div aria-hidden className="absolute left-1/2 top-[62%] h-[12rem] w-[34rem] -translate-x-1/2 animate-[spin_50s_linear_infinite] rounded-[50%] border border-dashed border-electric/25 [transform:rotateX(76deg)]" />
      <div aria-hidden className="absolute bottom-6 left-1/2 h-24 w-[60%] -translate-x-1/2 rounded-[50%] bg-electric/25 blur-3xl" />
      <div ref={ringRef} className="absolute inset-0 [transform-style:preserve-3d]">
        {items.map((f, i) => (
          <div
            key={f.id}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="absolute left-1/2 top-1/2 -ml-[8.75rem] -mt-[10rem] h-[20rem] w-[17.5rem] [backface-visibility:hidden]"
            style={{ transform: `rotateY(${i * STEP}deg) translateZ(${R}px)` }}
          >
            <QuestionCard f={f} onPick={onPick} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Row({ items, onPick }: { items: CatalogFaq[]; onPick: (id: string) => void }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none]">
      {items.map((f) => (
        <div key={f.id} className="h-64 w-[78%] shrink-0 snap-center sm:w-[44%]">
          <QuestionCard f={f} onPick={onPick} />
        </div>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Topic tiles: six tilting 3D tiles with counts and two sample questions.
 * ------------------------------------------------------------------------- */

export function TopicTiles({ onPick }: { onPick: (key: FaqCategoryKey) => void }) {
  return (
    <div className="grid gap-4 [perspective:1600px] sm:grid-cols-2 lg:grid-cols-3">
      {FAQ_CATEGORIES.map((c, i) => {
        const Icon = CATEGORY_ICON[c.key]
        const list = FAQ_CATALOG.filter((f) => f.category === c.key)
        return (
          <Tilt3D key={c.key} max={8} lift={18} className="h-full rounded-[1.75rem]" wrapperClassName="reveal h-full">
            <button
              type="button"
              onClick={() => onPick(c.key)}
              className="group relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] bg-midnight/85 p-7 text-left shadow-[0_40px_80px_-40px_rgb(0_0_0/0.85)] ring-1 ring-silver/10 backdrop-blur-xl transition duration-500 group-hover/tilt:ring-emerald/40"
            >
              <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br from-emerald/20 to-electric/10 blur-2xl transition-transform duration-700 group-hover:scale-125" />
              <div className="relative flex items-start justify-between">
                <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_18px_36px_-12px_rgb(0_185_154/0.8)] transition-transform duration-700 [transform:translateZ(60px)] group-hover:[transform:translateZ(90px)_rotate(-8deg)]">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="text-right">
                  <span className="block font-display text-4xl font-black leading-none text-white [transform:translateZ(30px)]">{pad(list.length)}</span>
                  <span className="label-tech text-steel-500">answers</span>
                </span>
              </div>
              <span className="relative mt-6 label-tech text-emerald">Topic {pad(i + 1)}</span>
              <span className="relative mt-2 font-display text-2xl font-bold text-white [transform:translateZ(30px)]">{c.title}</span>
              <span className="relative mt-2 text-sm leading-relaxed text-steel-400">{c.desc}</span>
              <ul className="relative mt-5 space-y-2 border-t border-white/10 pt-5">
                {list.slice(0, 2).map((f) => (
                  <li key={f.id} className="flex items-start gap-2 text-[0.8125rem] leading-snug text-steel-300">
                    <span className="mt-1.5 size-1 shrink-0 rotate-45 bg-emerald" aria-hidden /> {f.q}
                  </li>
                ))}
              </ul>
              <span className="relative mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-white">
                Browse topic <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-emerald via-electric to-royal transition-transform duration-700 group-hover:scale-x-100" />
            </button>
          </Tilt3D>
        )
      })}
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Answer browser: sticky topic rail with live counts and search, and the
 * questions grouped by topic (and by service or sector within those topics).
 * ------------------------------------------------------------------------- */

interface BrowserProps {
  query: string
  setQuery: (q: string) => void
  open: Set<string>
  toggle: (id: string) => void
  setAll: (ids: string[]) => void
}

export function FaqBrowser({ query, setQuery, open, toggle, setAll }: BrowserProps) {
  const filtered = useMemo(() => FAQ_CATALOG.filter((f) => matches(f, query)), [query])
  const cats = FAQ_CATEGORIES.map((c) => ({ ...c, items: filtered.filter((f) => f.category === c.key) }))
  const [active, setActive] = useState<FaqCategoryKey>('company')

  useEffect(() => {
    const els = FAQ_CATEGORIES.map((c) => document.getElementById(`topic-${c.key}`)).filter((el): el is HTMLElement => Boolean(el))
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActive(vis[0].target.id.replace('topic-', '') as FaqCategoryKey)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [query])

  const allOpen = filtered.length > 0 && filtered.every((f) => open.has(f.id))

  return (
    <div className="grid gap-10 lg:grid-cols-[17.5rem_1fr] lg:gap-14">
      {/* Rail */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <SearchBox query={query} setQuery={setQuery} />
        <p className="mt-3 text-xs text-steel-500" aria-live="polite">
          {query ? (
            <>
              <span className="font-semibold text-white">{filtered.length}</span> of {FAQ_CATALOG.length} answers match
            </>
          ) : (
            <>
              <span className="font-semibold text-white">{FAQ_CATALOG.length}</span> answers across {FAQ_CATEGORIES.length} topics
            </>
          )}
        </p>

        <nav aria-label="FAQ topics" className="mt-6 hidden lg:block">
          <ul className="relative space-y-1 border-l border-white/10">
            {cats.map((c) => {
              const Icon = CATEGORY_ICON[c.key]
              const on = active === c.key
              return (
                <li key={c.key}>
                  <a
                    href={`#topic-${c.key}`}
                    aria-current={on ? 'location' : undefined}
                    className={cn('group relative -ml-px flex items-center gap-3 border-l-2 py-2.5 pl-4 pr-2 text-sm transition duration-300', on ? 'border-emerald text-white' : 'border-transparent text-steel-400 hover:border-silver/30 hover:text-white', !c.items.length && 'opacity-40')}
                  >
                    <Icon className={cn('size-4 transition-colors', on ? 'text-emerald' : 'text-steel-500 group-hover:text-teal-300')} aria-hidden />
                    <span className="flex-1">{c.title}</span>
                    <span className={cn('rounded-full px-2 py-0.5 font-mono text-[0.7rem] transition', on ? 'bg-emerald/20 text-emerald' : 'bg-white/5 text-steel-500')}>{c.items.length}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setAll(allOpen ? [] : filtered.map((f) => f.id))}
          disabled={!filtered.length}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-silver/15 px-4 py-2 text-sm font-semibold text-steel-300 transition hover:border-emerald/50 hover:text-white disabled:opacity-40"
        >
          {allOpen ? <ChevronsDownUp className="size-4" aria-hidden /> : <ChevronsUpDown className="size-4" aria-hidden />}
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>

        <Tilt3D max={6} lift={12} className="rounded-[1.5rem]" wrapperClassName="mt-8 hidden lg:block">
          <div className="relative overflow-hidden rounded-[1.5rem] border-metallic surface-metal p-6">
            <Texture variant="lines" className="opacity-40" />
            <p className="relative label-tech text-emerald">Not listed?</p>
            <p className="relative mt-2 font-display text-lg font-bold leading-snug text-white">Ask our engineering team directly.</p>
            <Link to="/contact" className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-midnight transition hover:bg-emerald">
              Send a question <ArrowUpRight className="size-4" aria-hidden />
            </Link>
            {COMPANY.contact.email && (
              <a href={`mailto:${COMPANY.contact.email}`} className="relative mt-4 flex items-center gap-2 text-sm text-steel-300 transition hover:text-white">
                <Mail className="size-4 text-emerald" aria-hidden />
                <span className="link-underline">{COMPANY.contact.email}</span>
              </a>
            )}
          </div>
        </Tilt3D>
      </aside>

      {/* Answers */}
      <div className="min-w-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-silver/20 px-8 py-20 text-center">
            <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-white/5 text-steel-400">
              <SearchX className="size-7" aria-hidden />
            </span>
            <p className="mt-6 font-display text-2xl font-bold text-white">No answers match &ldquo;{query}&rdquo;</p>
            <p className="mt-2 max-w-md text-steel-400">Try a different word, or send the question to our team and we will answer it directly.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => setQuery('')} className={buttonStyles({ variant: 'ghost', size: 'md' })}>
                Clear search
              </button>
              <Link to="/contact" className={buttonStyles({ variant: 'emerald', size: 'md' })}>
                Ask our team <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-20">
            {cats.map((c) => (c.items.length ? <TopicGroup key={c.key} cat={c} items={c.items} query={query} open={open} toggle={toggle} /> : <span key={c.key} id={`topic-${c.key}`} className="block" />))}
          </div>
        )}
      </div>
    </div>
  )
}

function SearchBox({ query, setQuery, large = false, onSubmit }: { query: string; setQuery: (q: string) => void; large?: boolean; onSubmit?: () => void }) {
  return (
    <form
      role="search"
      aria-label={large ? 'Search all questions' : 'Filter questions'}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
      className={cn(
        'group relative flex items-center rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl transition focus-within:border-emerald/60 focus-within:bg-white/[0.09] focus-within:shadow-[0_0_0_4px_rgb(0_185_154/0.15)]',
        large ? 'h-16 pl-5 pr-2' : 'h-12 pl-4 pr-1.5',
      )}
    >
      <Search className={cn('shrink-0 text-steel-400 group-focus-within:text-emerald', large ? 'size-5' : 'size-4')} aria-hidden />
      <label className="sr-only" htmlFor={large ? 'faq-search-hero' : 'faq-search'}>
        Search questions
      </label>
      <input
        id={large ? 'faq-search-hero' : 'faq-search'}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={large ? 'Try permit, turnaround or drawings…' : 'Search questions…'}
        className={cn('h-full min-w-0 flex-1 bg-transparent px-3 text-white placeholder:text-steel-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden', large ? 'text-base' : 'text-sm')}
      />
      {query && (
        <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="inline-flex size-8 items-center justify-center rounded-full text-steel-400 transition hover:bg-white/10 hover:text-white">
          <X className="size-4" aria-hidden />
        </button>
      )}
      {large && (
        <button type="submit" className={buttonStyles({ variant: 'emerald', size: 'md', className: 'ml-2 min-h-12' })}>
          Search
        </button>
      )}
    </form>
  )
}

export { SearchBox }

function TopicGroup({ cat, items, query, open, toggle }: { cat: (typeof FAQ_CATEGORIES)[number]; items: CatalogFaq[]; query: string; open: Set<string>; toggle: (id: string) => void }) {
  const Icon = CATEGORY_ICON[cat.key]
  const groups = useMemo(() => {
    const m = new Map<string, CatalogFaq[]>()
    for (const f of items) {
      const k = f.group ?? ''
      m.set(k, [...(m.get(k) ?? []), f])
    }
    return [...m.entries()]
  }, [items])
  let n = 0

  return (
    <section id={`topic-${cat.key}`} className="scroll-mt-36" aria-labelledby={`topic-${cat.key}-title`}>
      <header className="flex items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="flex items-center gap-5">
          <span className="relative inline-flex size-16 shrink-0 items-center justify-center rounded-2xl border-metallic surface-metal text-emerald shadow-[0_24px_50px_-20px_rgb(0_0_0/0.8)]">
            <Icon className="size-7" aria-hidden />
          </span>
          <div>
            <p className="label-tech text-emerald">{pad(FAQ_CATEGORIES.findIndex((c) => c.key === cat.key) + 1)} · Topic</p>
            <h2 id={`topic-${cat.key}-title`} className="mt-1 font-display text-3xl font-bold text-white md:text-4xl">{cat.title}</h2>
            <p className="mt-1 text-sm text-steel-400">{cat.desc}</p>
          </div>
        </div>
        <span className="hidden font-display text-5xl font-black leading-none text-white/10 md:block">{pad(items.length)}</span>
      </header>

      <div className="mt-8 space-y-10">
        {groups.map(([group, list]) => (
          <div key={group || cat.key}>
            {group && (
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-3 font-display text-lg font-semibold text-white">
                  <span className="h-px w-6 bg-gradient-to-r from-emerald to-transparent" aria-hidden />
                  <Highlight text={group} query={query} />
                </h3>
                {list[0]?.link && (
                  <Link to={list[0].link.href} aria-label={`Open page: ${group}`} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-teal-300 transition hover:text-white">
                    <span className="hidden sm:inline">Open page</span> <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                )}
              </div>
            )}
            <ol className="space-y-3">
              {list.map((f) => {
                n += 1
                return <FaqCard key={f.id} f={f} n={n} query={query} isOpen={open.has(f.id)} toggle={toggle} />
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  )
}

function FaqCard({ f, n, query, isOpen, toggle }: { f: CatalogFaq; n: number; query: string; isOpen: boolean; toggle: (id: string) => void }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    const url = `${window.location.origin}/faqs#${f.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.history.replaceState(null, '', `#${f.id}`)
    }
  }

  return (
    <li id={f.id} className="scroll-mt-40 [perspective:1400px]">
      <div
        className={cn(
          'group relative overflow-hidden rounded-2xl ring-1 transition-all duration-500 ease-[var(--ease-out-expo)]',
          isOpen
            ? 'bg-[linear-gradient(160deg,rgb(11_76_147/0.55),rgb(6_23_47/0.9))] shadow-[0_40px_80px_-40px_rgb(0_185_154/0.45)] ring-emerald/40 [transform:translateZ(16px)]'
            : 'bg-white/[0.03] ring-silver/10 hover:bg-white/[0.06] hover:ring-silver/25 hover:[transform:translateZ(10px)_rotateX(2deg)]',
        )}
      >
        <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1 origin-top bg-gradient-to-b from-emerald to-electric transition-transform duration-500', isOpen ? 'scale-y-100' : 'scale-y-0')} />
        <h3>
          <button type="button" id={`${f.id}-question`} aria-expanded={isOpen} aria-controls={`${f.id}-answer`} onClick={() => toggle(f.id)} className="flex w-full items-start gap-4 px-5 py-5 text-left md:px-6">
            <span className={cn('mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs transition-colors', isOpen ? 'bg-emerald text-midnight' : 'bg-white/5 text-steel-400 group-hover:text-white')}>{pad(n)}</span>
            <span className={cn('flex-1 font-display text-[1.0625rem] font-semibold leading-snug transition-colors md:text-lg', isOpen ? 'text-white' : 'text-steel-100')}>
              <Highlight text={f.q} query={query} />
            </span>
            <span className={cn('mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full ring-1 transition-all duration-500', isOpen ? 'rotate-45 bg-white text-midnight ring-white' : 'text-steel-300 ring-silver/20 group-hover:ring-emerald/50 group-hover:text-white')}>
              <Plus className="size-4" aria-hidden />
            </span>
          </button>
        </h3>
        <div id={`${f.id}-answer`} role="region" aria-labelledby={`${f.id}-question`} className="grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
          <div className="overflow-hidden">
            <div className={cn('origin-top pb-6 pl-[4.25rem] pr-6 transition-[transform,opacity] duration-500 ease-[var(--ease-out-expo)] md:pl-[4.5rem]', isOpen ? 'opacity-100 [transform:rotateX(0deg)]' : 'opacity-0 [transform:rotateX(-18deg)]')}>
              <p className="max-w-3xl leading-relaxed text-steel-300">
                <Highlight text={f.a} query={query} />
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {f.link && (
                  <Link to={f.link.href} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-emerald hover:text-midnight hover:ring-emerald">
                    {f.link.label} <ArrowUpRight className="size-4" aria-hidden />
                  </Link>
                )}
                <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-steel-400 transition hover:text-white">
                  {copied ? <Check className="size-3.5 text-emerald" aria-hidden /> : <Link2 className="size-3.5" aria-hidden />}
                  {copied ? 'Link copied' : 'Copy link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

/* ----------------------------------------------------------------------------
 * Closing panel: a layered 3D card with routes onward.
 * ------------------------------------------------------------------------- */

export function StillHaveQuestion({ children }: { children?: ReactNode }) {
  const routes = [
    { href: '/contact', icon: MessageSquareText, title: 'Send an enquiry', text: 'Our engineering team replies directly.' },
    { href: '/services', icon: Layers, title: 'Explore services', text: 'Nine service lines, one point of accountability.' },
    { href: '/industries', icon: Factory, title: 'Explore industries', text: 'Four sectors, one standard.' },
  ]
  return (
    <Container className="relative">
      <div className="relative isolate overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,#0b4c93_0%,#09264b_50%,#06172f_100%)] p-8 shadow-[0_60px_120px_-60px_rgb(0_0_0/0.9)] md:p-14">
        <div aria-hidden className="absolute -left-24 -top-24 -z-10 size-[26rem] animate-[aurora_18s_ease-in-out_infinite_alternate] rounded-full bg-emerald/25 blur-3xl motion-reduce:animate-none" />
        <div aria-hidden className="absolute -bottom-32 right-0 -z-10 size-[30rem] animate-[aurora_22s_ease-in-out_infinite_alternate-reverse] rounded-full bg-electric/30 blur-3xl motion-reduce:animate-none" />
        <Texture variant="lines" className="-z-10 opacity-30" />
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="flex items-center gap-3 label-tech text-emerald">
              <span className="h-px w-8 bg-emerald" aria-hidden /> Still have a question?
            </p>
            <h2 className="mt-5 text-display-lg font-bold text-white">
              We will answer it <em>directly</em>.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-steel-300">Send us your question with a little context about the asset and scope, and a member of our engineering team will come back to you.</p>
            {COMPANY.contact.email && (
              <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-steel-300">
                <Mail className="size-4 text-emerald" aria-hidden /> Email us at
                <a href={`mailto:${COMPANY.contact.email}`} className="link-underline font-semibold text-white">
                  {COMPANY.contact.email}
                </a>
              </p>
            )}
            {children}
          </div>
          <div className="grid gap-4 [perspective:1600px] sm:grid-cols-3 lg:grid-cols-1">
            {routes.map((r, i) => (
              <Tilt3D key={r.href} max={8} lift={16} className="rounded-[1.5rem]">
                <Link to={r.href} className="group relative flex items-center gap-5 overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/[0.06] p-5 backdrop-blur-xl transition hover:border-emerald/40 lg:ml-[var(--o)]" style={{ ['--o' as string]: `${i * 2}rem` }}>
                  <span className={cn('inline-flex size-12 shrink-0 items-center justify-center rounded-2xl text-white transition-transform duration-700 [transform:translateZ(40px)] group-hover:[transform:translateZ(60px)_rotate(-8deg)]', i === 0 ? 'bg-gradient-to-br from-emerald to-teal-500 text-midnight' : 'bg-gradient-to-br from-electric to-royal')}>
                    <r.icon className="size-5" aria-hidden />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-lg font-bold text-white">{r.title}</span>
                    <span className="mt-0.5 block text-sm text-steel-300">{r.text}</span>
                  </span>
                  <ArrowUpRight className="size-5 text-steel-400 transition group-hover:rotate-45 group-hover:text-emerald" aria-hidden />
                </Link>
              </Tilt3D>
            ))}
          </div>
        </div>
      </div>
    </Container>
  )
}
