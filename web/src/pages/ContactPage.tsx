import { useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Compass,
  Factory,
  FileText,
  HardHat,
  Layers,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Truck,
  UserRoundCheck,
  Wrench,
} from 'lucide-react'
import { CinematicHero } from '@/components/hero/CinematicHero'
import { Container } from '@/components/Container'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ContactForm } from '@/components/forms/ContactForm'
import { SectionHeading } from '@/components/SectionHeading'
import { Texture } from '@/components/Texture'
import { ProcessSteps } from '@/components/inner/InnerSections'
import { AboutFaq } from '@/components/about/AboutSections'
import { Seo } from '@/lib/seo'
import { cn } from '@/lib/cn'
import { scrollToElement } from '@/lib/lenis'
import logoSrc from '@/assets/brand/logo.webp'
import { COMPANY, hasVerifiedContact } from '@/data/company'
import { CONTACT_FAQ } from '@/data/faq'
import { SERVICES } from '@/data/services'
import { INDUSTRIES } from '@/data/industries'

const TOPICS = [
  { t: 'New project', icon: HardHat, d: 'Plan a new scope, from engineering and fabrication through construction and commissioning.' },
  { t: 'Shutdown & maintenance', icon: Wrench, d: 'Turnarounds, planned maintenance, repairs and support for operating assets.' },
  { t: 'Equipment & supply', icon: Truck, d: 'Oilfield equipment, materials and spares sourced to your specification.' },
  { t: 'General enquiry', icon: MessageSquareText, d: 'Anything else about working with GULF NEXT, as an operator or a contractor.' },
]

const INCLUDE = ['Asset type and location', 'Scope of work, even if only outline', 'The window or schedule you are working to', 'Known constraints, such as live plant or access', 'Drawings or specifications you can share']

const STEPS = [
  { title: 'Share your scope', desc: 'Tell us the asset, location, scope and the window you are working to.' },
  { title: 'Technical review', desc: 'Our engineers review feasibility, risks and the right mix of disciplines.' },
  { title: 'Practical proposal', desc: 'You receive an approach, a resourcing plan and a mobilisation outline.' },
]

/**
 * Contact. The hero keeps its still refinery image (no video). Below it:
 * enquiry types that preselect the form, the enquiry form with a guidance
 * panel, what happens next, quick routes into the site and a contact FAQ.
 * Contact channels are rendered only when verified in data/company.ts.
 */
export default function ContactPage() {
  const { contact } = COMPANY
  const verified = hasVerifiedContact(contact)
  const [topic, setTopic] = useState(TOPICS[0]!.t)
  const formRef = useRef<HTMLDivElement>(null)

  const pick = (t: string) => {
    setTopic(t)
    if (formRef.current) scrollToElement(formRef.current, -140)
  }

  return (
    <>
      <Seo
        title="Contact"
        description="Tell us about your project and our engineering team will come back with a practical plan."
        path="/contact"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: CONTACT_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />

      <CinematicHero
        section="home.opening"
        still
        loading="eager"
        height="medium"
        overlay="strong"
        header={<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />}
        eyebrow="Contact"
        heading={<>Tell us about your <em>project</em>.</>}
        description="Our engineering team will come back to you with a practical view on feasibility, approach and mobilisation."
      />

      {/* Enquiry types + form */}
      <AnimatedSection id="enquiry" className="relative flow-root scroll-mt-24 overflow-x-clip bg-deep pb-24 md:pb-32">
        <Texture variant="grid" />
        <div aria-hidden className="absolute -left-40 top-[28rem] size-[36rem] rounded-full bg-electric/10 blur-3xl" />
        <div aria-hidden className="absolute -right-40 bottom-0 size-[32rem] rounded-full bg-emerald/10 blur-3xl" />

        <Container className="relative">
          {/* Enquiry types, lifted over the hero edge */}
          <div className="relative z-10 -mt-14 grid gap-4 [perspective:1600px] sm:grid-cols-2 md:-mt-20 lg:grid-cols-4">
            {TOPICS.map((tp, i) => {
              const on = tp.t === topic
              const Icon = tp.icon
              return (
                <Tilt3D key={tp.t} max={9} lift={18} className="h-full rounded-[1.5rem]" wrapperClassName="reveal h-full">
                  <button
                    type="button"
                    onClick={() => pick(tp.t)}
                    aria-pressed={on}
                    className={cn(
                      'group relative flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] p-6 text-left ring-1 transition duration-500',
                      on
                        ? 'bg-[linear-gradient(155deg,#0b4c93_0%,#073b75_50%,#06172f_100%)] shadow-[0_40px_80px_-36px_rgb(0_185_154/0.55)] ring-emerald/50'
                        : 'bg-midnight/85 shadow-[0_30px_60px_-36px_rgb(0_0_0/0.8)] ring-silver/10 backdrop-blur-xl group-hover/tilt:ring-emerald/30',
                    )}
                  >
                    <span aria-hidden className="absolute right-5 top-4 font-display text-5xl font-black leading-none text-white/[0.06] transition-colors duration-500 group-hover:text-white/[0.12]">{String(i + 1).padStart(2, '0')}</span>
                    <span
                      className={cn(
                        'relative inline-flex size-12 items-center justify-center rounded-2xl transition-all duration-700 [transform:translateZ(50px)] group-hover/tilt:[transform:translateZ(75px)_rotate(-6deg)]',
                        on ? 'bg-gradient-to-br from-emerald to-teal-500 text-midnight shadow-[0_14px_30px_-10px_rgb(0_185_154/0.8)]' : 'bg-white/[0.06] text-emerald',
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="relative mt-6 font-display text-lg font-bold text-white [transform:translateZ(30px)]">{tp.t}</span>
                    <span className="relative mt-2 text-sm leading-relaxed text-steel-400">{tp.d}</span>
                    <span className={cn('relative mt-auto flex items-center gap-2 pt-5 text-sm font-semibold transition-colors', on ? 'text-emerald' : 'text-steel-300 group-hover:text-white')}>
                      {on ? (
                        <>
                          <Check className="size-4" aria-hidden /> Selected
                        </>
                      ) : (
                        <>
                          Start this enquiry <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
                        </>
                      )}
                    </span>
                    <span aria-hidden className={cn('absolute inset-x-0 bottom-0 h-1 origin-left bg-gradient-to-r from-emerald via-electric to-royal transition-transform duration-700', on ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100')} />
                  </button>
                </Tilt3D>
              )
            })}
          </div>

          <div className="mt-24 grid gap-12 lg:grid-cols-[1.4fr_0.8fr] lg:gap-14">
            {/* Form, set on layered plates for depth */}
            <div ref={formRef} className="reveal relative [perspective:2000px]">
              <div aria-hidden className="absolute inset-x-8 -bottom-6 top-8 rounded-[2rem] border border-emerald/15 bg-emerald/[0.03]" />
              <div aria-hidden className="absolute inset-x-4 -bottom-3 top-4 rounded-[2rem] border border-electric/20 bg-electric/[0.04]" />
              <div className="relative overflow-hidden rounded-[2rem] border-metallic bg-[linear-gradient(170deg,rgb(11_76_147/0.35),rgb(6_23_47/0.92)_40%)] p-6 shadow-[0_60px_120px_-50px_rgb(0_0_0/0.9)] backdrop-blur-xl md:p-10">
                <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald via-electric to-royal" />
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="label-tech text-emerald">Project enquiry</p>
                    <h2 className="mt-3 font-display text-2xl font-bold text-white md:text-3xl">Start a conversation</h2>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-xs text-steel-300 ring-1 ring-white/10">
                    <ShieldCheck className="size-3.5 text-emerald" aria-hidden /> Read by our engineering team
                  </span>
                </div>
                <ContactForm topics={TOPICS.map((t) => t.t)} topic={topic} onTopicChange={setTopic} withServices />
              </div>
            </div>

            {/* Guidance */}
            <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
              <Tilt3D max={6} lift={12} className="rounded-[1.75rem]" wrapperClassName="reveal">
                <div className="relative overflow-hidden rounded-[1.75rem] glass p-7">
                  <div className="flex items-center gap-3 [transform:translateZ(30px)]">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-royal text-white">
                      <FileText className="size-[1.1rem]" aria-hidden />
                    </span>
                    <h3 className="font-display text-lg font-bold text-white">Helpful to include</h3>
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {INCLUDE.map((it) => (
                      <li key={it} className="flex items-start gap-3 text-sm text-steel-300">
                        <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald/15 text-emerald">
                          <Check className="size-3" aria-hidden />
                        </span>
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Tilt3D>

              <Tilt3D max={6} lift={12} className="rounded-[1.75rem]" wrapperClassName="reveal">
                <div className="relative overflow-hidden rounded-[1.75rem] border-metallic surface-metal p-7">
                  <Texture variant="lines" className="opacity-40" />
                  {verified ? (
                    <div className="relative">
                      <h3 className="font-display text-lg font-bold text-white">Prefer to talk it through?</h3>
                      <ul className="mt-5 space-y-3.5 text-sm">
                        {contact.email && (
                          <li className="flex gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-emerald" aria-hidden /><a className="link-underline text-white" href={`mailto:${contact.email}`}>{contact.email}</a></li>
                        )}
                        {contact.phone && (
                          <li className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-emerald" aria-hidden /><a className="link-underline text-white" href={`tel:${contact.phone.replace(/\s+/g, '')}`}>{contact.phone}</a></li>
                        )}
                        {contact.address && (
                          <li className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-emerald" aria-hidden /><address className="not-italic text-white">{contact.address.join(', ')}</address></li>
                        )}
                        {contact.hours && (
                          <li className="flex gap-3"><Clock className="mt-0.5 size-4 shrink-0 text-emerald" aria-hidden /><span className="text-white">{contact.hours}</span></li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div className="relative flex items-start gap-4">
                      <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-[0_14px_30px_-12px_rgb(0_0_0/0.6)] [transform:translateZ(40px)]">
                        <img src={logoSrc} alt="" className="h-full w-full object-contain" />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-bold text-white">Who reads your enquiry</h3>
                        <p className="mt-2 text-sm leading-relaxed text-steel-300">A member of our engineering team reviews every scope and replies directly, with a practical view on how the work could be delivered.</p>
                      </div>
                    </div>
                  )}
                </div>
              </Tilt3D>

              <div className="reveal flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
                  <UserRoundCheck className="size-5" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed text-steel-300">Operator or EPC contractor, we work both ways: directly for asset owners or within a wider project team.</p>
              </div>
            </aside>
          </div>
        </Container>
      </AnimatedSection>

      {/* What happens next */}
      <AnimatedSection id="next" className="theme-light relative scroll-mt-32 overflow-hidden bg-white py-24 md:py-32">
        <Texture variant="grid-light" />
        <Container className="relative">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading tone="light" index="02" eyebrow="What happens next" title={<>A clear path from <em>enquiry</em> to plan.</>} />
            <p className="reveal max-w-md text-steel-700 lg:text-right">Three steps between sending the form and having a practical plan in front of you.</p>
          </div>
          <ProcessSteps steps={STEPS} tone="light" />
        </Container>
      </AnimatedSection>

      {/* Explore */}
      <AnimatedSection id="explore" className="theme-light relative scroll-mt-32 overflow-hidden bg-paper py-24 md:py-28">
        <Texture variant="glow-light" />
        <Container className="relative">
          <SectionHeading tone="light" index="03" eyebrow="Before you write" title={<>Find the right <em>starting point</em>.</>} lead="Knowing which service or sector your scope sits in helps us route it to the right specialists." />
          <div className="mt-14 grid gap-6 [perspective:1600px] md:grid-cols-3">
            {[
              { href: '/services', icon: Layers, eyebrow: `${SERVICES.length} service lines`, title: 'Services', text: 'Field services, pipelines, mechanical works, construction, maintenance and supply.' },
              { href: '/industries', icon: Factory, eyebrow: `${INDUSTRIES.length} sectors`, title: 'Industries', text: 'Oil and gas, petrochemical, industrial construction and mechanical equipment.' },
              { href: '/about', icon: Compass, eyebrow: 'Company', title: 'About GULF NEXT', text: 'Who we are, how we work and the values that guide every scope.' },
            ].map((c) => (
              <Tilt3D key={c.href} max={9} lift={18} className="h-full rounded-[1.75rem]" wrapperClassName="reveal h-full">
                <Link to={c.href} className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white p-8 shadow-[0_30px_60px_-44px_rgb(9_38_75/0.6)] ring-1 ring-royal/10 transition-shadow duration-500 group-hover/tilt:shadow-[0_50px_80px_-40px_rgb(8_126_219/0.5)]">
                  <c.icon aria-hidden className="absolute -bottom-8 -right-8 size-44 text-royal/[0.05] transition-transform duration-700 group-hover:-rotate-6 group-hover:scale-110" />
                  <div className="relative flex items-start justify-between">
                    <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-royal text-white shadow-[0_18px_36px_-12px_rgb(8_126_219/0.85)] transition-transform duration-700 [transform:translateZ(60px)] group-hover:[transform:translateZ(85px)_rotate(-8deg)]">
                      <c.icon className="size-6" aria-hidden />
                    </span>
                    <span className="inline-flex size-10 items-center justify-center rounded-full text-royal ring-1 ring-royal/15 transition duration-500 group-hover:rotate-45 group-hover:bg-emerald group-hover:text-midnight group-hover:ring-emerald">
                      <ArrowUpRight className="size-4" aria-hidden />
                    </span>
                  </div>
                  <p className="relative mt-10 label-tech text-teal-500">{c.eyebrow}</p>
                  <h3 className="relative mt-2 font-display text-2xl font-bold text-midnight [transform:translateZ(30px)]">{c.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-steel-700">{c.text}</p>
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-emerald via-electric to-royal transition-transform duration-700 group-hover:scale-x-100" />
                </Link>
              </Tilt3D>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      <AboutFaq
        items={CONTACT_FAQ}
        index="04"
        title={<>Before you <em>get in touch</em>.</>}
        lead="Common questions about sending an enquiry and what to expect from our team."
        askHref="#enquiry"
      />
    </>
  )
}
