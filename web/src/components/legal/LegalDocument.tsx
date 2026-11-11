import { Fragment, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown, Clock3, Globe, Link2, MessageSquareText, Printer } from 'lucide-react'
import { Container } from '@/components/Container'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Texture } from '@/components/Texture'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { buttonStyles } from '@/lib/buttonStyles'
import { cn } from '@/lib/cn'
import { scrollToElement } from '@/lib/lenis'
import { Seo, absoluteUrl, breadcrumbJsonLd } from '@/lib/seo'
import { PAGE_META } from '@/config/site'
import { COMPANY } from '@/data/company'
import { LEGAL_DOCS, type LegalBlock, type LegalDoc, type LegalSection } from '@/data/legal'

const pad = (n: number) => String(n).padStart(2, '0')
const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/** Words in a block, for the reading-time estimate. */
function blockText(b: LegalBlock): string {
  if (typeof b === 'string') return b
  if ('list' in b) return b.list.join(' ')
  if ('subheading' in b) return b.subheading
  if ('note' in b) return b.note
  return b.defs.map((d) => `${d.term} ${d.text}`).join(' ')
}
function readingMinutes(doc: LegalDoc): number {
  const words = doc.sections
    .flatMap((s) => [s.title, s.summary ?? '', ...s.blocks.map(blockText)])
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

/* ----------------------------------------------------------------------------
 * Inline copy: [label](href) links and **bold**.
 * ------------------------------------------------------------------------- */

const INLINE = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g
const LINK_CLASS = 'font-medium text-royal underline decoration-electric/35 decoration-1 underline-offset-[3px] transition hover:text-electric hover:decoration-electric'

function Rich({ text, onAnchor }: { text: string; onAnchor: (id: string) => void }) {
  return (
    <>
      {text.split(INLINE).map((part, i) => {
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
        if (link) {
          const [, label, href] = link as unknown as [string, string, string]
          if (href.startsWith('#'))
            return (
              <a key={i} href={href} className={LINK_CLASS} onClick={(e) => { e.preventDefault(); onAnchor(href.slice(1)) }}>
                {label}
              </a>
            )
          if (href.startsWith('/'))
            return (
              <Link key={i} to={href} className={LINK_CLASS}>
                {label}
              </Link>
            )
          const external = href.startsWith('http')
          return (
            <a key={i} href={href} className={LINK_CLASS} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {label}
              {external && <ArrowUpRight className="ml-0.5 inline size-3.5 align-[-0.1em]" aria-hidden />}
              {external && <span className="sr-only"> (opens in a new tab)</span>}
            </a>
          )
        }
        const bold = /^\*\*([^*]+)\*\*$/.exec(part)
        if (bold) return <strong key={i} className="font-semibold text-midnight">{bold[1]}</strong>
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}

function Block({ block, onAnchor }: { block: LegalBlock; onAnchor: (id: string) => void }) {
  if (typeof block === 'string') return <p><Rich text={block} onAnchor={onAnchor} /></p>
  if ('subheading' in block) return <h3 className="!mt-9 font-display text-lg font-semibold text-midnight">{block.subheading}</h3>
  if ('note' in block)
    return (
      <aside className="relative overflow-hidden rounded-2xl border border-electric/15 bg-[linear-gradient(120deg,rgb(8_126_219/0.07),rgb(0_185_154/0.06))] py-4 pl-6 pr-5 text-[0.9375rem] text-steel-700">
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald to-electric" />
        <Rich text={block.note} onAnchor={onAnchor} />
      </aside>
    )
  if ('list' in block)
    return (
      <ul className="space-y-3">
        {block.list.map((item) => (
          <li key={item} className="relative pl-7">
            <span aria-hidden className="absolute left-0 top-[0.55em] inline-flex size-3.5 items-center justify-center rounded-full bg-emerald/15">
              <span className="size-1.5 rounded-full bg-emerald" />
            </span>
            <Rich text={item} onAnchor={onAnchor} />
          </li>
        ))}
      </ul>
    )
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {block.defs.map((d) => (
        <div key={d.term} className="group rounded-2xl border border-royal/[0.08] bg-paper/70 p-5 transition duration-300 hover:border-electric/25 hover:bg-white hover:shadow-[0_18px_40px_-26px_rgb(9_38_75/0.45)]">
          <dt className="flex items-center gap-2.5 font-display text-[0.9375rem] font-semibold text-midnight">
            <span aria-hidden className="h-3.5 w-0.5 rounded-full bg-gradient-to-b from-emerald to-electric transition-all duration-300 group-hover:h-4" />
            {d.term}
          </dt>
          <dd className="mt-2 text-[0.9rem] leading-relaxed text-steel-700">
            <Rich text={d.text} onAnchor={onAnchor} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* ----------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

/**
 * Shared layout for the Privacy Policy and Terms of Service: a dark hero with
 * a document card, plain-language highlights, then the full text on a light
 * reading surface with a sticky contents rail that tracks the section in view
 * and how far through the document the reader is. Every section has its own
 * link (/privacy-policy#your-rights); the global scroll handler lands on it.
 */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  const meta = PAGE_META[doc.path]
  const other = LEGAL_DOCS.find((d) => d.path !== doc.path)!
  const minutes = readingMinutes(doc)
  const [active, setActive] = useState(doc.sections[0]!.id)
  const articleRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const percentRef = useRef<HTMLSpanElement>(null)

  // Section in view: the last one whose top has passed 35% of the viewport.
  useEffect(() => {
    const els = doc.sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [doc])

  // Reading progress through the article, written straight to the DOM.
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = articleRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight * 0.6
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - r.top) / Math.max(1, total)))
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p.toFixed(4)})`
      if (percentRef.current) percentRef.current.textContent = `${Math.round(p * 100)}%`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const goTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    scrollToElement(el, -110)
    window.history.replaceState(window.history.state, '', `#${id}`)
    setActive(id)
  }

  const Icon = doc.icon

  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={doc.path}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: doc.name,
            url: absoluteUrl(doc.path),
            description: meta.description,
            datePublished: doc.effective,
            dateModified: doc.updated,
            publisher: { '@type': 'Organization', name: COMPANY.legalName },
          },
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: doc.name, path: doc.path },
          ]),
        ]}
      />

      {/* Hero */}
      <section data-print="hide" aria-label={doc.name} className="relative isolate overflow-hidden bg-midnight pb-36 pt-32 md:pb-44 md:pt-44">
        <Texture variant="grid" className="-z-10" />
        <Texture variant="noise" className="-z-10" />
        <div aria-hidden className="absolute -left-48 -top-20 -z-10 size-[42rem] rounded-full bg-electric/15 blur-3xl" />
        <div aria-hidden className="absolute -right-40 bottom-0 -z-10 size-[34rem] rounded-full bg-emerald/10 blur-3xl" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-[#081f3e]" />

        <Container className="relative grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div className="animate-[rise_.9s_var(--ease-out-expo)]">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Legal' }, { label: doc.name }]} />
            <p className="mt-8 flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-emerald to-silver/0" aria-hidden />
              <span className="font-display font-expanded text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-silver">Legal &amp; compliance</span>
            </p>
            <h1 className="mt-6 text-display-xl font-bold text-white">
              {doc.heading} <em>{doc.headingEm}</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{doc.intro}</p>

            <ul className="mt-8 flex flex-wrap gap-2.5 text-sm text-white/80">
              {[
                { icon: CalendarDays, t: `Updated ${formatDate(doc.updated)}` },
                { icon: Clock3, t: `${minutes} min read` },
                { icon: Globe, t: 'United Arab Emirates' },
              ].map(({ icon: I, t }) => (
                <li key={t} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 backdrop-blur-md">
                  <I className="size-4 text-teal-300" aria-hidden /> {t}
                </li>
              ))}
            </ul>

            {/* Document switcher */}
            <nav aria-label="Legal documents" className="mt-9 inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
              {LEGAL_DOCS.map((d) => {
                const on = d.path === doc.path
                return (
                  <Link
                    key={d.path}
                    to={d.path}
                    aria-current={on ? 'page' : undefined}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-semibold transition duration-300 sm:px-5',
                      on ? 'bg-white text-midnight shadow-[0_10px_30px_-12px_rgb(255_255_255/0.5)]' : 'text-white/70 hover:text-white',
                    )}
                  >
                    {d.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <DocumentCard doc={doc} icon={<Icon className="size-7" aria-hidden />} />
        </Container>
      </section>

      {/* At a glance, lifted over the hero edge */}
      <AnimatedSection className="theme-light relative bg-paper" stagger={0.07}>
        <div aria-hidden data-print="hide" className="absolute inset-x-0 top-0 h-40 bg-[#081f3e]" />
        <Container className="relative -mt-24 md:-mt-28" data-print="hide">
          <div className="reveal mb-4 flex items-center gap-3 label-tech text-white/70">
            <span className="h-px w-8 bg-emerald" aria-hidden /> At a glance
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {doc.glance.map(({ icon: G, title, text }, i) => (
              <li key={title} className="reveal group card-light relative overflow-hidden rounded-[1.5rem] p-6 transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(9_38_75/0.45)]">
                <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-emerald to-electric transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                <span aria-hidden className="absolute right-5 top-5 label-tech text-steel-400">{pad(i + 1)}</span>
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#0b4c93,#06172f)] text-teal-300 shadow-[0_14px_30px_-14px_rgb(7_59_117/0.8)] transition duration-500 group-hover:-rotate-6 group-hover:scale-105">
                  <G className="size-5" aria-hidden />
                </span>
                <p className="mt-5 font-display text-[1.05rem] font-semibold leading-snug text-midnight">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-steel-700">{text}</p>
              </li>
            ))}
          </ul>
        </Container>

        {/* Full text */}
        <Container className="relative grid gap-10 pb-24 pt-14 md:pb-32 md:pt-20 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-14">
          <Contents doc={doc} active={active} goTo={goTo} progressRef={progressRef} percentRef={percentRef} />

          <article ref={articleRef} className="card-light relative min-w-0 rounded-[2rem] px-5 py-8 sm:px-8 md:px-12 md:py-12 print:rounded-none print:border-0 print:p-0 print:shadow-none">
            {/* Print heading */}
            <div className="hidden print:mb-8 print:block">
              <p className="text-sm">{COMPANY.legalName}</p>
              <p className="text-3xl font-bold">{doc.name}</p>
              <p className="mt-1 text-sm">Effective {formatDate(doc.effective)} · Last updated {formatDate(doc.updated)}</p>
            </div>

            <div className="flex flex-col gap-4 border-b border-royal/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#00b99a,#087edb)] text-white shadow-[0_14px_30px_-14px_rgb(0_185_154/0.8)]">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-midnight">{doc.name}</p>
                  <p className="text-sm text-steel-500">
                    Effective {formatDate(doc.effective)} · Version {doc.version}
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-print="hide"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 self-start rounded-full border border-royal/15 px-4 py-2 text-sm font-semibold text-royal transition hover:border-electric/40 hover:bg-electric/5 sm:self-auto"
              >
                <Printer className="size-4" aria-hidden /> Print or save PDF
              </button>
            </div>

            {doc.sections.map((s, i) => (
              <Section key={s.id} section={s} index={i} path={doc.path} onAnchor={goTo} />
            ))}
          </article>
        </Container>

        {/* Closing */}
        <Container className="relative pb-24 md:pb-32" data-print="hide">
          <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
            <div className="reveal relative isolate overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0b4c93_0%,#09264b_50%,#06172f_100%)] p-8 text-white shadow-[0_40px_80px_-40px_rgb(6_23_47/0.8)] md:p-10">
              <div aria-hidden className="absolute -right-16 -top-20 -z-10 size-72 rounded-full bg-emerald/25 blur-3xl" />
              <Texture variant="lines" className="-z-10 opacity-40" />
              <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-teal-300">
                <MessageSquareText className="size-5" aria-hidden />
              </span>
              <h2 className="mt-6 text-display-md font-bold">
                Questions about this <em>{doc.path === '/privacy-policy' ? 'policy' : 'agreement'}</em>?
              </h2>
              <p className="mt-4 max-w-lg leading-relaxed text-steel-300">
                Our team is happy to explain anything here, or to set up a non-disclosure agreement before you share project details.
              </p>
              <Link to="/contact" className={buttonStyles({ variant: 'emerald', size: 'lg', className: 'mt-8' })}>
                Contact our team <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>

            <Link
              to={other.path}
              className="reveal group card-light relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-8 transition duration-500 hover:-translate-y-1 md:p-10"
            >
              <Texture variant="grid-light" />
              <div className="relative">
                <p className="label-tech text-steel-500">Read next</p>
                <p className="mt-4 font-display text-3xl font-bold tracking-tight text-midnight">{other.name}</p>
                <p className="mt-3 max-w-sm leading-relaxed text-steel-700">{other.intro}</p>
              </div>
              <span className="relative mt-8 inline-flex items-center gap-3 font-semibold text-royal">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-midnight text-white transition duration-500 group-hover:translate-x-1 group-hover:bg-electric">
                  <ArrowRight className="size-4" aria-hidden />
                </span>
                Open {other.name}
              </span>
            </Link>
          </div>
        </Container>
      </AnimatedSection>
    </>
  )
}

/* ----------------------------------------------------------------------------
 * Hero document card
 * ------------------------------------------------------------------------- */

function DocumentCard({ doc, icon }: { doc: LegalDoc; icon: ReactNode }) {
  const rows = [
    ['Document', doc.name],
    ['Version', doc.version],
    ['Effective', formatDate(doc.effective)],
    ['Last updated', formatDate(doc.updated)],
    ['Sections', pad(doc.sections.length)],
    ['Applies to', 'www.gulfnext.ae'],
  ]
  return (
    <div className="relative mx-auto w-full max-w-md animate-[rise_1.2s_var(--ease-out-expo)] lg:mr-0">
      {/* Stacked sheets behind */}
      <div aria-hidden className="absolute inset-0 translate-x-5 translate-y-5 rotate-[4deg] rounded-[2rem] border border-white/10 bg-white/[0.03]" />
      <div aria-hidden className="absolute inset-0 translate-x-2.5 translate-y-2.5 rotate-[2deg] rounded-[2rem] border border-white/10 bg-white/[0.05]" />
      <div aria-hidden className="absolute -bottom-10 left-1/2 h-20 w-3/4 -translate-x-1/2 rounded-[50%] bg-electric/30 blur-3xl" />
      <Tilt3D max={7} lift={14} className="rounded-[2rem]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(160deg,rgb(11_76_147/0.8),rgb(6_23_47/0.95))] p-7 shadow-[0_50px_100px_-40px_rgb(0_0_0/0.9)] backdrop-blur-xl md:p-8">
          <Texture variant="lines" className="opacity-50" />
          <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          <div className="relative flex items-start justify-between">
            <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#00b99a,#087edb)] text-white shadow-[0_18px_40px_-14px_rgb(0_185_154/0.9)] [transform:translateZ(30px)]">
              {icon}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald/15 px-3 py-1.5 label-tech text-teal-300 ring-1 ring-emerald/30">
              <span className="size-1.5 animate-[pulse-dot_2.4s_ease-in-out_infinite] rounded-full bg-emerald" /> In force
            </span>
          </div>
          <p className="relative mt-6 label-tech text-steel-400">{COMPANY.legalName}</p>
          <p className="relative mt-2 font-display text-2xl font-bold text-white">{doc.name}</p>
          <dl className="relative mt-6 divide-y divide-white/10 border-y border-white/10">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-3 text-sm">
                <dt className="label-tech text-steel-400">{k}</dt>
                <dd className="text-right font-medium text-white/90">{v}</dd>
              </div>
            ))}
          </dl>
          <div aria-hidden className="relative mt-6 flex items-end justify-between">
            <svg viewBox="0 0 160 40" className="h-9 w-36 text-teal-300/80">
              <path d="M4 30 C 20 6, 30 34, 44 18 S 66 8, 72 26 S 96 30, 104 14 S 128 22, 156 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="label-tech text-steel-500">Ref. GN-{doc.path === '/privacy-policy' ? 'PP' : 'TOS'}-{doc.version}</span>
          </div>
        </div>
      </Tilt3D>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Contents rail (desktop) / dropdown (mobile)
 * ------------------------------------------------------------------------- */

interface ContentsProps {
  doc: LegalDoc
  active: string
  goTo: (id: string) => void
  progressRef: React.RefObject<HTMLSpanElement | null>
  percentRef: React.RefObject<HTMLSpanElement | null>
}

function Contents({ doc, active, goTo, progressRef, percentRef }: ContentsProps) {
  const activeIndex = doc.sections.findIndex((s) => s.id === active)
  const [open, setOpen] = useState(false)

  const click = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    goTo(id)
  }

  const list = (
    <ol className="space-y-0.5">
      {doc.sections.map((s, i) => {
        const on = s.id === active
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={click(s.id)}
              aria-current={on ? 'location' : undefined}
              className={cn(
                'group relative flex items-baseline gap-3 rounded-xl py-2 pl-4 pr-3 text-sm leading-snug transition duration-300',
                on ? 'bg-white font-semibold text-midnight shadow-[0_10px_24px_-18px_rgb(9_38_75/0.6)]' : 'text-steel-700 hover:bg-white/60 hover:text-midnight',
              )}
            >
              <span aria-hidden className={cn('absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b from-emerald to-electric transition-opacity duration-300', on ? 'opacity-100' : 'opacity-0')} />
              <span className={cn('font-mono text-[0.7rem] tabular-nums', on ? 'font-semibold text-teal-600' : i < activeIndex ? 'text-teal-600' : 'text-steel-400')}>{pad(i + 1)}</span>
              {s.title}
            </a>
          </li>
        )
      })}
    </ol>
  )

  return (
    <div data-print="hide" className="lg:sticky lg:top-28 lg:self-start">
      {/* Mobile */}
      <div className="card-light overflow-hidden rounded-2xl lg:hidden">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
          <span>
            <span className="block label-tech text-steel-500">On this page</span>
            <span className="mt-1 block font-semibold text-midnight">
              {pad(activeIndex + 1)} · {doc.sections[activeIndex]?.title}
            </span>
          </span>
          <ChevronDown className={cn('size-5 shrink-0 text-steel-500 transition-transform duration-300', open && 'rotate-180')} aria-hidden />
        </button>
        <div className={cn('grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
          <div className="overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto border-t border-royal/10 bg-paper/60 p-2" data-lenis-prevent>
              {list}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <nav aria-label="On this page" className="hidden lg:block">
        <div className="flex items-center justify-between">
          <p className="label-tech text-steel-500">On this page</p>
          <span ref={percentRef} className="font-mono text-[0.7rem] tabular-nums text-steel-500">0%</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-royal/10">
          <span ref={progressRef} className="block h-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-emerald to-electric" />
        </div>
        <div className="-mx-1 mt-5 max-h-[calc(100vh-15rem)] overflow-y-auto px-1 pb-1" data-lenis-prevent>
          {list}
        </div>
        <Link to="/contact" className="group mt-6 flex items-center justify-between gap-3 rounded-2xl border border-royal/10 bg-white/60 px-4 py-3.5 text-sm font-semibold text-royal transition hover:border-electric/30 hover:bg-white">
          Ask a question
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </Link>
      </nav>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Section
 * ------------------------------------------------------------------------- */

function Section({ section, index, path, onAnchor }: { section: LegalSection; index: number; path: string; onAnchor: (id: string) => void }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    void navigator.clipboard?.writeText(absoluteUrl(`${path}#${section.id}`)).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="group/section scroll-mt-28 border-b border-royal/[0.08] py-10 last:border-b-0 last:pb-0 md:py-12 print:break-inside-avoid-page">
      <div className="flex items-start gap-4 md:gap-6">
        <span aria-hidden className="mt-1 hidden font-display text-4xl font-black leading-none text-transparent [-webkit-text-stroke:1px_rgb(7_59_117/0.25)] transition-colors duration-500 group-hover/section:[-webkit-text-stroke:1px_rgb(0_185_154/0.7)] sm:block">
          {pad(index + 1)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 id={`${section.id}-title`} className="font-display text-[1.5rem] font-bold leading-tight text-midnight md:text-[1.75rem]">
              <span className="mr-2 font-mono text-sm font-medium text-teal-600 sm:hidden">{pad(index + 1)}</span>
              {section.title}
            </h2>
            <button
              type="button"
              data-print="hide"
              onClick={copy}
              aria-label={copied ? 'Link copied' : `Copy link to “${section.title}”`}
              className={cn(
                'mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-royal/10 text-steel-500 transition duration-300 hover:border-electric/40 hover:text-electric focus-visible:opacity-100',
                copied ? 'border-emerald/40 text-teal-600 opacity-100' : 'opacity-100 md:opacity-0 md:group-hover/section:opacity-100',
              )}
            >
              {copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
            </button>
          </div>

          {section.summary && (
            <p className="mt-5 flex gap-3 rounded-2xl bg-midnight px-5 py-4 text-[0.9375rem] leading-relaxed text-white/85">
              <span className="mt-0.5 shrink-0 label-tech text-teal-300">In short</span>
              <span>{section.summary}</span>
            </p>
          )}

          <div className="mt-6 space-y-5 text-[0.98rem] leading-[1.8] text-steel-700">
            {section.blocks.map((b, i) => (
              <Block key={i} block={b} onAnchor={onAnchor} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
