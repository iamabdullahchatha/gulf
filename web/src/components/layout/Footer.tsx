import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type SVGProps } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowRight, ArrowUp, ArrowUpRight, Clock, HardHat, Layers, Mail, MapPin, MapPinned, MessageCircleQuestion, Phone } from 'lucide-react'
import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Texture } from '@/components/Texture'
import { buttonStyles } from '@/lib/buttonStyles'
import { cn } from '@/lib/cn'
import { scrollToElement } from '@/lib/lenis'
import { COMPANY_LINKS } from '@/data/navigation'
import { SERVICES } from '@/data/services'
import { INDUSTRIES } from '@/data/industries'
import { COMPANY, hasVerifiedContact } from '@/data/company'
import { LinkedInIcon } from '@/components/icons/LinkedInIcon'

const PILLARS = [
  { icon: Layers, t: 'Integrated delivery', d: 'One contract. One owner.' },
  { icon: HardHat, t: 'Safety-first culture', d: 'Everyone home, every day.' },
  { icon: MapPinned, t: 'Regional know-how', d: 'Built for Gulf conditions.' },
]

const SECTORS = ['Oil & Gas', 'Petrochemical', 'Construction', 'Mechanical']

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
]

interface FooterLink {
  label: string
  href: string
}

/**
 * Site footer: an optional closing statement, a brand band with the three
 * delivery pillars, a four-column link grid with an enquiry panel, a large
 * brand wordmark and a legal bar.
 *
 * Contact details come only from `data/company.ts` (verified facts); null
 * fields are never rendered. The homepage ends with its own contact chapter
 * and the contact page is the destination itself, so the closing statement is
 * skipped on both.
 */
export function Footer() {
  const year = new Date().getFullYear()
  const { contact, registrationNumber, legalName } = COMPANY
  const verified = hasVerifiedContact(contact)
  const { pathname } = useLocation()
  const showStatement = !['/', '/contact', '/faqs', ...LEGAL_LINKS.map((l) => l.href)].includes(pathname)
  const revealRef = useReveal<HTMLDivElement>()

  return (
    <footer className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#071d3b_0%,#06172f_40%,#030d1d_100%)] text-steel-300">
      <Texture variant="grid" className="opacity-20" />
      <Texture variant="noise" className="opacity-[0.035] mix-blend-overlay" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald/70 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -left-56 top-1/4 -z-10 size-[40rem] rounded-full bg-electric/[0.08] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-56 bottom-24 -z-10 size-[36rem] rounded-full bg-emerald/[0.07] blur-3xl" />

      {showStatement && <Statement />}

      <div ref={revealRef}>
        {/* Brand band */}
        <Container className="relative pt-16 md:pt-20">
          <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="reveal lg:col-span-5">
              <div className="relative inline-block">
                <div aria-hidden className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,rgb(8_126_219/0.3),transparent)] blur-xl" />
                <Logo size="lg" className="relative" />
              </div>
              <p className="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-steel-300">
                Integrated oil &amp; gas contracting, industrial engineering and infrastructure solutions for operators and EPC contractors.
              </p>
              <ul aria-label="Sectors we serve" className="mt-6 flex flex-wrap gap-2">
                {SECTORS.map((s) => (
                  <li key={s} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-steel-300">
                    <span aria-hidden className="size-1.5 rounded-full bg-emerald shadow-[0_0_8px_rgb(0_185_154/0.8)]" />
                    {s}
                  </li>
                ))}
              </ul>
              {COMPANY.social.linkedin && (
                <a
                  href={COMPANY.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-4 text-sm font-medium text-steel-200 transition hover:border-[#0a66c2]/60 hover:bg-[#0a66c2]/15 hover:text-white"
                >
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#0a66c2] text-white">
                    <LinkedInIcon className="size-3.5" />
                  </span>
                  Follow us on LinkedIn
                  <ArrowUpRight className="size-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </div>

            <ul className="reveal grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-panel sm:grid-cols-3 lg:col-span-7">
              {PILLARS.map(({ icon: Icon, t, d }, i) => (
                <li key={t} className="group relative overflow-hidden bg-[#061a35] p-5 transition-colors duration-500 hover:bg-[#08223f] md:p-6">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-emerald to-electric transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                  <span aria-hidden className="absolute -bottom-16 -right-16 size-36 rounded-full bg-emerald/0 blur-2xl transition-colors duration-700 group-hover:bg-emerald/15" />
                  <span aria-hidden className="absolute right-5 top-5 label-tech text-steel-500 transition-colors duration-500 group-hover:text-emerald md:right-6 md:top-6">0{i + 1}</span>
                  <div className="flex items-center gap-4 sm:block">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-teal-300 transition duration-500 group-hover:-translate-y-0.5 group-hover:border-emerald/40 group-hover:bg-emerald/15">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-display text-base font-semibold tracking-tight text-white sm:mt-5">{t}</p>
                      <p className="mt-1 text-sm text-steel-400">{d}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Container>

        {/* Link grid */}
        <Container className="relative grid grid-cols-2 gap-x-6 gap-y-12 py-14 md:py-16 lg:grid-cols-12 lg:gap-x-10">
          <FooterColumn index="01" title="Company" className="reveal lg:col-span-2" links={COMPANY_LINKS} pathname={pathname} />
          <FooterColumn
            index="02"
            title="Industries"
            className="reveal lg:col-span-2"
            links={INDUSTRIES.map((i) => ({ label: i.title, href: `/industries/${i.slug}` }))}
            all={{ label: 'All industries', href: '/industries' }}
            pathname={pathname}
          />
          <FooterColumn
            index="03"
            title="Services"
            className="reveal col-span-2 lg:col-span-5"
            listClassName="sm:columns-2 sm:gap-x-8"
            links={SERVICES.map((s) => ({ label: s.title, href: `/services/${s.slug}` }))}
            all={{ label: 'All services', href: '/services' }}
            pathname={pathname}
          />

          {/* Enquiry panel, framed by a slowly orbiting light */}
          <div className="reveal col-span-2 lg:col-span-3">
            <div className="footer-orbit relative rounded-2xl p-px shadow-[0_30px_70px_-30px_rgb(0_185_154/0.35)]">
              <div className="relative isolate overflow-hidden rounded-[calc(1rem-1px)] bg-[linear-gradient(150deg,#0b3a72_0%,#08223f_55%,#061a35_100%)] p-6 md:p-7">
                <div aria-hidden className="absolute -right-12 -top-12 -z-10 size-40 rounded-full bg-emerald/25 blur-3xl" />
                <Texture variant="lines" className="-z-10 opacity-20" />
                <h2 className="flex items-center gap-3 label-tech text-white">
                  <span className="text-emerald">04</span>
                  <span className="h-px w-5 bg-white/25" aria-hidden />
                  Enquiries
                </h2>
                <p className="mt-4 font-display text-xl font-semibold tracking-tight text-white">
                  Have a scope in <em>mind</em>?
                </p>
                {verified ? (
                  <ul className="mt-4 space-y-3 text-sm">
                    {contact.email && (
                      <ContactRow icon={Mail}>
                        <a href={`mailto:${contact.email}`} className="link-underline text-white/90 hover:text-white">{contact.email}</a>
                      </ContactRow>
                    )}
                    {contact.phone && (
                      <ContactRow icon={Phone}>
                        <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="link-underline text-white/90 hover:text-white">{contact.phone}</a>
                      </ContactRow>
                    )}
                    {contact.address && (
                      <ContactRow icon={MapPin}>
                        <address className="not-italic text-white/90">{contact.address.map((l) => <span key={l} className="block">{l}</span>)}</address>
                      </ContactRow>
                    )}
                    {contact.hours && (
                      <ContactRow icon={Clock}>
                        <span className="text-white/90">{contact.hours}</span>
                      </ContactRow>
                    )}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-relaxed text-steel-300">Send us your scope, site and schedule. Our engineering team will respond directly.</p>
                )}
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row lg:flex-col">
                  <Link to="/contact" className={buttonStyles({ variant: 'emerald', size: 'md', className: 'flex-1 whitespace-nowrap' })}>
                    Start an enquiry <ArrowUpRight className="size-4" aria-hidden />
                  </Link>
                  <Link to="/faqs" className={buttonStyles({ variant: 'ghost', size: 'md', className: 'flex-1 whitespace-nowrap' })}>
                    <MessageCircleQuestion className="size-4" aria-hidden /> Read FAQs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="relative">
        <Wordmark />
      </Container>

      {/* Legal bar */}
      <div className="relative border-t border-white/10 bg-abyss/70 backdrop-blur-sm">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <Container className="grid gap-5 py-6 text-xs text-steel-400 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
              <p>
                &copy; {year} {legalName}. All rights reserved.
              </p>
              {registrationNumber && (
                <>
                  <span aria-hidden className="hidden h-3 w-px bg-white/15 sm:block" />
                  <p className="label-tech text-steel-500">CR No. {registrationNumber}</p>
                </>
              )}
            </div>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {LEGAL_LINKS.map((l, i) => {
                  const current = l.href === pathname
                  return (
                    <li key={l.href} className="flex items-center gap-5">
                      {i > 0 && <span aria-hidden className="size-1 rounded-full bg-emerald/70" />}
                      <Link
                        to={l.href}
                        aria-current={current ? 'page' : undefined}
                        className={cn('link-underline font-medium transition-colors hover:text-white', current ? 'text-white' : 'text-steel-300')}
                      >
                        {l.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
          <p aria-hidden className="hidden items-center gap-3 label-tech text-steel-500 md:flex">
            Engineer <span className="size-1 rounded-full bg-emerald" /> Build <span className="size-1 rounded-full bg-electric" /> Maintain
          </p>
          <div className="md:justify-self-end">
            <BackToTop />
          </div>
        </Container>
      </div>
    </footer>
  )
}

/**
 * Fades and lifts every `.reveal` inside the returned ref, in sequence, the
 * first time the block scrolls into view. Reduced motion is handled by the
 * global `.reveal` rules in index.css.
 */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>('.reveal'))
    items.forEach((el, i) => (el.style.transitionDelay = `${i * 70}ms`))
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        items.forEach((el) => el.classList.add('is-in'))
        io.disconnect()
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [])
  return ref
}

/**
 * Oversized outlined brand wordmark. A soft emerald light follows the pointer
 * across the letters. Decorative.
 */
function Wordmark() {
  const ref = useRef<SVGSVGElement>(null)
  const spot = useRef<SVGRadialGradientElement>(null)
  const [lit, setLit] = useState(false)

  const move = (e: ReactPointerEvent<SVGSVGElement>) => {
    const svg = ref.current
    const g = spot.current
    if (!svg || !g) return
    const r = svg.getBoundingClientRect()
    g.setAttribute('cx', String(((e.clientX - r.left) / r.width) * 1000))
    g.setAttribute('cy', String(((e.clientY - r.top) / r.height) * 200))
  }

  const text = (props: SVGProps<SVGTextElement>) => (
    <text
      x="500"
      y="186"
      textAnchor="middle"
      textLength="996"
      lengthAdjust="spacingAndGlyphs"
      fontSize="228"
      fontWeight="800"
      style={{ fontFamily: 'var(--font-display)', fontStretch: '125%', letterSpacing: '-0.02em' }}
      {...props}
    >
      GULF NEXT
    </text>
  )

  return (
    <div aria-hidden className="relative -mb-px select-none pt-2">
      <svg
        ref={ref}
        viewBox="0 0 1000 200"
        className="block w-full"
        onPointerMove={move}
        onPointerEnter={() => setLit(true)}
        onPointerLeave={() => setLit(false)}
      >
        <defs>
          <linearGradient id="wm-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wm-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c5ced8" stopOpacity="0.32" />
            <stop offset="1" stopColor="#c5ced8" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="wm-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4dd6bd" />
            <stop offset="1" stopColor="#2e96ea" />
          </linearGradient>
          <radialGradient ref={spot} id="wm-spot" gradientUnits="userSpaceOnUse" cx="500" cy="100" r="190">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="wm-mask">
            <rect width="1000" height="200" fill="url(#wm-spot)" />
          </mask>
        </defs>
        {text({ fill: 'url(#wm-fill)', stroke: 'url(#wm-stroke)', strokeWidth: 1 })}
        <g mask="url(#wm-mask)" style={{ opacity: lit ? 1 : 0, transition: 'opacity 0.6s ease' }}>
          {text({ fill: 'url(#wm-glow)', fillOpacity: 0.22, stroke: 'url(#wm-glow)', strokeWidth: 1.4 })}
        </g>
      </svg>
    </div>
  )
}

function ContactRow({ icon: Icon, children }: { icon: typeof Mail; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-emerald">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="pt-1">{children}</span>
    </li>
  )
}

/** Closing statement: a polished panel with drifting light and a plant drawing that draws itself in. */
function Statement() {
  return (
    <Container className="relative pt-16 md:pt-20">
      <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#0b4c93_0%,#09264b_48%,#06172f_100%)] px-7 py-12 shadow-[0_50px_100px_-50px_rgb(0_0_0/0.9)] md:px-14 md:py-16">
        <div aria-hidden className="absolute -left-20 -top-24 -z-10 size-[26rem] animate-[aurora_18s_ease-in-out_infinite_alternate] rounded-full bg-emerald/25 blur-3xl motion-reduce:animate-none" />
        <div aria-hidden className="absolute -bottom-32 right-0 -z-10 size-[30rem] animate-[aurora_22s_ease-in-out_infinite_alternate-reverse] rounded-full bg-electric/30 blur-3xl motion-reduce:animate-none" />
        <Texture variant="lines" className="-z-10 opacity-30" />
        <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="flex items-center gap-3 label-tech text-emerald">
              <span className="h-px w-8 bg-emerald" aria-hidden /> Start a conversation
            </p>
            <h2 className="mt-5 text-display-lg font-bold text-white">
              Let&rsquo;s engineer what&rsquo;s <em>next</em>.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-steel-300 md:text-lg">Tell us about the scope, the site and the schedule. We will put the right specialists on it.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className={buttonStyles({ variant: 'emerald', size: 'lg' })}>
                Request a proposal <ArrowUpRight className="size-4" aria-hidden />
              </Link>
              <Link to="/services" className={buttonStyles({ variant: 'ghost', size: 'lg' })}>
                Our capabilities
              </Link>
            </div>
          </div>
          <PlantDrawing />
        </div>
      </div>
    </Container>
  )
}

/** Engineering line drawing of a small process plant; each line draws in once it scrolls into view. Decorative. */
function PlantDrawing() {
  const ref = useRef<SVGSVGElement>(null)
  const reduced = usePrefersReducedMotion()
  const [seen, setSeen] = useState(false)
  const drawn = seen || reduced
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        setSeen(true)
        io.disconnect()
      }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const lines = [
    'M20 270 H400',
    'M60 270 V34',
    'M100 270 V66 Q115 44 130 66 V270',
    'M94 112 H136 M94 162 H136 M94 212 H136',
    'M136 76 V270 M144 76 V270 M136 96 H144 M136 136 H144 M136 176 H144 M136 216 H144 M136 256 H144',
    'M165 270 V112 Q177 96 189 112 V270',
    'M160 150 H194 M160 200 H194',
    'M130 128 C160 128 175 200 210 200',
    'M210 200 H340 M210 214 H340',
    'M222 270 V214 M262 270 V214 M302 270 V214 M338 270 V214',
    'M250 200 V168 H290 V200',
    'M356 248 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0',
    'M340 270 L345 266 M372 270 L367 266',
    'M100 286 H189 M100 281 V291 M189 281 V291',
  ]

  return (
    <div aria-hidden className="relative hidden lg:block">
      <div className="absolute inset-6 rounded-3xl border border-white/[0.06] bg-white/[0.02]" />
      <svg ref={ref} viewBox="0 0 420 310" className="relative w-full">
        <defs>
          <linearGradient id="plant-stroke" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="420" y2="310">
            <stop offset="0" stopColor="#4dd6bd" />
            <stop offset="1" stopColor="#5fb2f2" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#plant-stroke)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          {lines.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={drawn ? 0 : 1}
              style={{ transition: `stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1) ${(i * 0.11).toFixed(2)}s` }}
            />
          ))}
          <path d="M56 34 Q60 18 64 34" stroke="#ffb347" strokeOpacity={drawn ? 0.9 : 0} style={{ transition: 'stroke-opacity 1s ease 1.6s' }} />
        </g>
        <g fill="#00b99a" style={{ opacity: drawn ? 1 : 0, transition: 'opacity 1s ease 1.8s' }}>
          {[[115, 50], [177, 100], [60, 30], [356, 224]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5">
              <animate attributeName="opacity" values="0.35;1;0.35" dur="3s" begin={`${i * 0.7}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
        <g fill="#8fa3b8" fontFamily="ui-monospace, monospace" fontSize="8.5" letterSpacing="2" style={{ opacity: drawn ? 1 : 0, transition: 'opacity 1s ease 2s' }}>
          <text x="100" y="303">ENGINEER</text>
          <text x="236" y="160">BUILD</text>
          <text x="318" y="303">MAINTAIN</text>
        </g>
      </svg>
    </div>
  )
}

interface FooterColumnProps {
  index: string
  title: string
  links: FooterLink[]
  /** Optional "view all" link shown under the list. */
  all?: FooterLink
  pathname: string
  className?: string
  listClassName?: string
}

/** A titled link list. The link for the current page is highlighted and marked aria-current. */
function FooterColumn({ index, title, links, all, pathname, className, listClassName }: FooterColumnProps) {
  return (
    <nav aria-label={title} className={className}>
      <h2 className="flex items-center gap-3 label-tech text-white">
        <span className="text-emerald">{index}</span>
        <span className="h-px w-5 bg-white/25" aria-hidden />
        {title}
      </h2>
      <ul className={cn('mt-6 text-sm', listClassName)}>
        {links.map((l) => {
          const current = l.href === pathname
          return (
            <li key={l.href} className="break-inside-avoid pb-3">
              <Link
                to={l.href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'group inline-flex items-start leading-snug transition-colors duration-300 hover:text-white',
                  current ? 'text-white' : 'text-steel-300',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'mt-[0.6em] h-px shrink-0 bg-emerald transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:mr-2 group-hover:w-3',
                    current ? 'mr-2 w-3' : 'mr-0 w-0',
                  )}
                />
                {l.label}
              </Link>
            </li>
          )
        })}
      </ul>
      {all && (
        <Link to={all.href} className="group mt-2 inline-flex items-center gap-2 text-sm font-semibold text-teal-300 transition-colors hover:text-white">
          {all.label}
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </nav>
  )
}

/** Back-to-top control with a ring that fills as the page is read. */
function BackToTop() {
  const ring = useRef<SVGCircleElement>(null)
  useEffect(() => {
    const C = 2 * Math.PI * 18
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - p))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      type="button"
      onClick={() => {
        const top = document.getElementById('main')
        if (top) scrollToElement(top)
        else window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="group inline-flex items-center gap-3 self-start text-xs font-medium text-steel-300 transition hover:text-white sm:self-auto"
    >
      Back to top
      <span className="relative inline-flex size-11 items-center justify-center">
        <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgb(197 206 216 / 0.18)" strokeWidth="2" />
          <circle ref={ring} cx="22" cy="22" r="18" fill="none" stroke="url(#btt)" strokeWidth="2" strokeLinecap="round" strokeDasharray={2 * Math.PI * 18} strokeDashoffset={2 * Math.PI * 18} />
          <defs>
            <linearGradient id="btt" x1="0" x2="1">
              <stop offset="0" stopColor="#00b99a" />
              <stop offset="1" stopColor="#087edb" />
            </linearGradient>
          </defs>
        </svg>
        <ArrowUp className="size-4 transition group-hover:-translate-y-0.5" aria-hidden />
      </span>
    </button>
  )
}

