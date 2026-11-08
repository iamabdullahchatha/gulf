import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowUp, ArrowUpRight, Clock, HardHat, Layers, Mail, MapPin, MapPinned, Phone } from 'lucide-react'
import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import { Marquee } from '@/components/Marquee'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Texture } from '@/components/Texture'
import { buttonStyles } from '@/lib/buttonStyles'
import { scrollToElement } from '@/lib/lenis'
import { COMPANY_LINKS } from '@/data/navigation'
import { SERVICES } from '@/data/services'
import { INDUSTRIES } from '@/data/industries'
import { COMPANY, hasVerifiedContact } from '@/data/company'

const TRUST = [
  { icon: Layers, t: 'Integrated delivery' },
  { icon: HardHat, t: 'Safety-first culture' },
  { icon: MapPinned, t: 'Regional know-how' },
]

const SITE = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Industries', href: '/industries' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact', href: '/contact' },
]

/**
 * Site footer: a calm closing band, an orderly link grid and a legal bar.
 *
 * Contact details come only from `data/company.ts` (verified facts); null
 * fields are never rendered. The homepage ends with its own contact chapter
 * and the contact page is the destination itself, so the closing band is
 * skipped on both.
 */
export function Footer() {
  const year = new Date().getFullYear()
  const { contact, registrationNumber, legalName } = COMPANY
  const verified = hasVerifiedContact(contact)
  const { pathname } = useLocation()
  const showStatement = !['/', '/contact', '/faqs'].includes(pathname)

  return (
    <footer className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#09264b_0%,#06172f_50%,#040f22_100%)] text-steel-300">
      <Texture variant="grid" className="opacity-25" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald/70 to-transparent" />
      <div aria-hidden className="absolute -left-48 top-1/3 size-[36rem] rounded-full bg-electric/[0.08] blur-3xl" />
      <div aria-hidden className="absolute -right-48 bottom-10 size-[32rem] rounded-full bg-emerald/[0.07] blur-3xl" />

      {/* Capability ribbon */}
      <div className="relative border-b border-white/10 bg-white/[0.02]">
        <Marquee items={SERVICES.map((s) => s.title)} className="py-4" />
      </div>

      {showStatement && <Statement />}

      <Container className="relative grid gap-12 pb-14 pt-16 md:grid-cols-2 md:pt-20 lg:grid-cols-12 lg:gap-10">
        {/* Brand */}
        <div className="md:col-span-2 lg:col-span-4">
          <div className="relative inline-block">
            <div aria-hidden className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,rgb(8_126_219/0.35),transparent)] blur-xl" />
            <Logo size="xl" className="relative rounded-2xl px-4 py-2" />
          </div>
          <p className="mt-7 max-w-sm text-sm leading-relaxed text-steel-300">
            Integrated oil &amp; gas contracting, industrial engineering and infrastructure solutions for operators and EPC contractors.
          </p>
          <ul className="mt-7 space-y-3">
            {TRUST.map(({ icon: Icon, t }) => (
              <li key={t} className="group flex items-center gap-3 text-sm text-white/85">
                <span className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-teal-300 transition duration-300 group-hover:border-emerald/40 group-hover:bg-emerald/15">
                  <Icon className="size-4" aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>
          {registrationNumber && <p className="mt-6 label-tech text-steel-500">CR No. {registrationNumber}</p>}
        </div>

        <FooterColumn title="Company" className="lg:col-span-2" links={COMPANY_LINKS} />
        <FooterColumn title="Services" className="lg:col-span-3" links={SERVICES.map((s) => ({ label: s.title, href: `/services/${s.slug}` }))} />

        <div className="space-y-10 lg:col-span-3">
          <FooterColumn title="Industries" links={INDUSTRIES.map((i) => ({ label: i.title, href: `/industries/${i.slug}` }))} />

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition duration-500 hover:border-emerald/30">
            <div aria-hidden className="absolute -right-10 -top-10 size-32 rounded-full bg-emerald/15 blur-2xl" />
            <h2 className="relative flex items-center gap-3 label-tech text-white">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald to-teal-500 text-midnight">
                <Mail className="size-3.5" aria-hidden />
              </span>
              Enquiries
            </h2>
            {verified ? (
              <ul className="relative mt-4 space-y-3 text-sm">
                {contact.email && (
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-emerald" aria-hidden />
                    <a href={`mailto:${contact.email}`} className="link-underline text-white/90 hover:text-white">{contact.email}</a>
                  </li>
                )}
                {contact.phone && (
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-emerald" aria-hidden />
                    <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="link-underline text-white/90 hover:text-white">{contact.phone}</a>
                  </li>
                )}
                {contact.address && (
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-emerald" aria-hidden />
                    <address className="not-italic text-white/90">{contact.address.map((l) => <span key={l} className="block">{l}</span>)}</address>
                  </li>
                )}
                {contact.hours && (
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-emerald" aria-hidden />
                    <span className="text-white/90">{contact.hours}</span>
                  </li>
                )}
              </ul>
            ) : (
              <p className="relative mt-4 text-sm leading-relaxed text-steel-300">Send us your scope and our engineering team will respond directly.</p>
            )}
            <Link to="/contact" className="group relative mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-midnight transition hover:bg-emerald">
              Open the enquiry form
              <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </Container>

      <Container className="relative">
        <Skyline />
      </Container>

      <Container className="relative flex flex-col gap-5 border-t border-white/10 py-7 text-xs text-steel-400 md:flex-row md:items-center md:justify-between">
        <p>
          &copy; {year} {legalName}. All rights reserved.
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {SITE.map((l) => (
              <li key={l.href}>
                <Link to={l.href} className="link-underline transition-colors hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <BackToTop />
      </Container>
    </footer>
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

function FooterColumn({ title, links, className }: { title: string; links: { label: string; href: string }[]; className?: string }) {
  return (
    <nav aria-label={title} className={className}>
      <h2 className="flex items-center gap-3 label-tech text-white">
        <span className="h-px w-5 bg-emerald" aria-hidden /> {title}
      </h2>
      <ul className="mt-5 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link to={l.href} className="group inline-flex items-start gap-2 leading-snug text-steel-300 transition-colors duration-300 hover:text-white">
              <span aria-hidden className="mt-[0.55em] h-px w-0 shrink-0 bg-emerald transition-all duration-300 group-hover:w-3" />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
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

/** Refinery skyline in line art — columns, spheres, tanks and a flare. Decorative. */
function Skyline() {
  return (
    <div aria-hidden className="relative h-16 opacity-60 md:h-20">
      <svg viewBox="0 0 1440 140" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="sky-stroke" x1="0" x2="1">
            <stop offset="0" stopColor="#c5ced8" stopOpacity="0" />
            <stop offset="0.2" stopColor="#c5ced8" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="#00b99a" stopOpacity="0.6" />
            <stop offset="0.8" stopColor="#c5ced8" stopOpacity="0.35" />
            <stop offset="1" stopColor="#c5ced8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#sky-stroke)" strokeWidth="1.2">
          <path d="M0 139 H1440" />
          {/* tanks */}
          <path d="M70 139 V112 Q110 104 150 112 V139 M170 139 V118 Q200 112 230 118 V139" />
          {/* columns */}
          <path d="M300 139 V48 Q312 40 324 48 V139 M300 70 H324 M300 95 H324 M338 139 V66 Q347 60 356 66 V139 M338 90 H356" />
          {/* pipe rack */}
          <path d="M370 120 H560 M370 112 H560 M390 139 V112 M440 139 V112 M490 139 V112 M540 139 V112" />
          {/* spheres */}
          <circle cx="610" cy="114" r="18" />
          <circle cx="660" cy="118" r="14" />
          <path d="M600 139 L606 130 M620 139 L614 130 M652 139 L656 131 M668 139 L664 131" />
          {/* tall column cluster */}
          <path d="M720 139 V34 Q732 26 744 34 V139 M720 60 H744 M720 85 H744 M720 110 H744 M758 139 V56 Q766 50 774 56 V139 M788 139 V74 Q795 69 802 74 V139" />
          {/* flare stack */}
          <path d="M860 139 V20" />
          <path d="M856 20 Q860 6 864 20" stroke="#ffb347" strokeOpacity="0.8" />
          {/* process unit */}
          <path d="M900 139 V96 H1010 V139 M920 96 V80 H990 V96 M930 80 V70 H980 V80" />
          {/* tanks */}
          <path d="M1050 139 V110 Q1100 101 1150 110 V139 M1170 139 V116 Q1205 109 1240 116 V139" />
          {/* chimneys */}
          <path d="M1280 139 V60 H1292 V139 M1310 139 V76 H1320 V139" />
          <path d="M1360 139 V118 Q1385 112 1410 118 V139" />
        </g>
        {[[732, 30, '#00b99a'], [312, 44, '#00b99a'], [1286, 56, '#087edb'], [766, 52, '#00b99a'], [347, 62, '#087edb'], [860, 20, '#ffb347']].map(([x, y, f], i) => (
          <circle key={i} cx={x} cy={y} r="2.2" fill={f as string}>
            <animate attributeName="opacity" values="0.25;1;0.25" dur={`${2.6 + (i % 3) * 0.7}s`} begin={`${i * 0.45}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  )
}
