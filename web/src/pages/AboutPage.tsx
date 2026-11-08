import { useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Compass, Eye, HardHat, Layers, MapPin, ShieldCheck, Workflow } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { CinematicFilm } from '@/components/hero/CinematicFilm'
import { Container } from '@/components/Container'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { Marquee } from '@/components/Marquee'
import { Picture } from '@/components/Picture'
import { SectionHeading } from '@/components/SectionHeading'
import { Texture } from '@/components/Texture'
import { PageNav, SplitFeature } from '@/components/inner/InnerSections'
import { Seo } from '@/lib/seo'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import logoSrc from '@/assets/brand/logo.webp'
import { ABOUT_FAQ } from '@/data/faq'
import { AboutFaq, CoreValues, HowWeWork } from '@/components/about/AboutSections'
import { SERVICE_GROUPS, servicesIn } from '@/data/services'
import { INDUSTRIES } from '@/data/industries'
import { ABOUT_FILM, ABOUT_FINALE, ABOUT_HERO } from '@/data/aboutFilm'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const NAV = [
  { id: 'who-we-are', label: 'Who we are' },
  { id: 'overview', label: 'Overview' },
  { id: 'vision', label: 'Vision & mission' },
  { id: 'values', label: 'Core values' },
  { id: 'process', label: 'How we work' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'operations', label: 'Operations' },
  { id: 'hse', label: 'Quality & safety' },
]

const PILLARS = [
  { icon: HardHat, title: 'Field-proven', desc: 'Methods shaped on live sites, onshore and offshore.' },
  { icon: Layers, title: 'Integrated', desc: 'Engineering, construction and maintenance under one roof.' },
  { icon: MapPin, title: 'Regional', desc: 'Familiar with Gulf conditions, standards and supply chains.' },
  { icon: Workflow, title: 'Long-term', desc: 'Judged by how assets perform long after handover.' },
]



const QUALITY = [
  'Permit-to-work treated as non-negotiable',
  'Stop-work authority for everyone on site',
  'Risk assessment before mobilisation',
  'Inspection and test plans for every scope',
  'Documented records at handover',
  'Lessons learned captured after each job',
]

/**
 * About: Scene 10 as a scroll-driven film, then who we are, company
 * overview, vision and mission, core values, a scroll-drawn delivery
 * timeline, capabilities, three capability chapters, quality and safety,
 * FAQs and a contact CTA. Cards tilt toward the pointer with layered depth.
 */
export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
      gsap.utils.toArray<HTMLElement>('[data-float]').forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? 10 : -10, duration: 3 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })
    },
    { scope: pageRef, dependencies: [reduced] },
  )

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ABOUT_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <div ref={pageRef}>
      <Seo
        title="About"
        description="GULF NEXT Oil and Gas provides integrated engineering, construction, maintenance and supply services for oil, gas, petrochemical and industrial facilities."
        path="/about"
        jsonLd={faqJsonLd}
      />

      <CinematicFilm scenes={ABOUT_FILM} skipTo="who-we-are" hero={ABOUT_HERO} finale={ABOUT_FINALE} segment={320} ease={0.16} label="About GULF NEXT: engineering strength, building trust" />

      <div className="border-y border-silver/10 bg-deep py-5">
        <Marquee items={['Field services', 'Pipeline works', 'Mechanical engineering', 'Industrial construction', 'Steel structures', 'Electromechanical', 'Maintenance & turnarounds', 'Equipment supply']} />
      </div>

      <PageNav items={NAV} />

      {/* Who we are */}
      <AnimatedSection id="who-we-are" className="relative scroll-mt-32 overflow-hidden py-24 md:py-32">
        <Texture variant="glow" />
        <Container className="relative grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            <SectionHeading index="01" eyebrow="Who we are" title={<>One accountable partner from concept to <em>operation</em>.</>} />
            <p className="reveal mt-8 max-w-xl text-lg leading-relaxed text-steel-400">
              GULF NEXT Oil and Gas works alongside operators and contractors to build, maintain and support the facilities the energy and
              industrial sectors depend on.
            </p>
            <p className="reveal mt-5 max-w-xl text-lg leading-relaxed text-steel-400">
              Our teams take ownership of outcomes, not just tasks, so projects move forward with fewer handovers and less risk.
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {PILLARS.map((p) => (
                <li key={p.title} className="reveal">
                  <Tilt3D max={10} lift={10} className="h-full rounded-2xl" wrapperClassName="h-full">
                    <div className="h-full rounded-2xl glass p-5 transition-colors duration-500 group-hover/tilt:bg-royal/40">
                      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-royal text-white shadow-[0_12px_24px_-10px_rgb(8_126_219/0.8)] transition-transform duration-500 [transform:translateZ(30px)] group-hover/tilt:[transform:translateZ(50px)_rotate(-8deg)]">
                        <p.icon className="size-5" aria-hidden />
                      </span>
                      <h3 className="mt-4 font-display text-lg font-semibold text-white [transform:translateZ(20px)]">{p.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-steel-400">{p.desc}</p>
                    </div>
                  </Tilt3D>
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal relative mx-auto w-full max-w-lg">
            <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-emerald/25 via-electric/15 to-transparent blur-2xl" />
            <Tilt3D max={7} lift={16} className="rounded-[2rem]">
              <div aria-hidden className="absolute -right-5 -top-5 h-full w-full rounded-[2rem] border border-emerald/40 [transform:translateZ(-40px)]" />
              <figure className="relative overflow-hidden rounded-[2rem] shadow-[0_50px_90px_-40px_rgb(0_0_0/0.8)] ring-1 ring-white/10">
                <Picture small="/assets/images/stock/industrial-team-briefing-sm.jpg" src="/assets/images/stock/industrial-team-briefing.jpg" alt="Site team in high-visibility workwear during a briefing" data-parallax className="aspect-[4/5] w-full scale-[1.14] object-cover" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent" />
                <figcaption className="absolute bottom-5 left-5 right-5 font-display text-lg font-semibold text-white">People, planning and field experience</figcaption>
              </figure>
              <span className="absolute -left-6 top-8 rounded-2xl bg-white p-3 shadow-[0_24px_50px_-18px_rgb(3_13_29/0.7)] [transform:translateZ(80px)]" data-float>
                <img src={logoSrc} alt="GULF NEXT Oil and Gas" width={580} height={430} className="h-12 w-auto" />
              </span>
              <div className="absolute -bottom-7 -right-4 flex items-center gap-3 rounded-2xl bg-midnight/90 px-4 py-3 shadow-[0_24px_50px_-18px_rgb(0_0_0/0.8)] ring-1 ring-emerald/30 backdrop-blur-md [transform:translateZ(100px)] sm:-right-8" data-float>
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-emerald/15 text-emerald">
                  <ShieldCheck className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block label-tech text-teal-300">Delivery</span>
                  <span className="block text-sm font-semibold text-white">Safety-led, every scope</span>
                </span>
              </div>
            </Tilt3D>
          </div>
        </Container>
      </AnimatedSection>

      {/* Company overview */}
      <AnimatedSection id="overview" className="theme-light relative scroll-mt-32 overflow-hidden bg-paper py-24 md:py-32">
        <Texture variant="grid-light" />
        <Texture variant="glow-light" />
        <Container className="relative grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading tone="light" index="02" eyebrow="Company overview" title={<>Integrated services for the <em>energy</em> sector.</>} />
            <p className="reveal mt-8 text-lg leading-relaxed text-steel-700">
              GULF NEXT provides field services, pipeline works, mechanical engineering, industrial construction, steel structures,
              electromechanical works, maintenance and equipment supply.
            </p>
            <p className="reveal mt-5 text-lg leading-relaxed text-steel-700">
              Each service can be delivered on its own or combined into one coordinated scope with a single point of accountability.
            </p>
            <Link to="/services" className="reveal link-underline mt-8 inline-flex items-center gap-2 font-semibold text-royal">
              Explore our services <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <Tilt3D max={6} lift={14} className="rounded-[2rem]" wrapperClassName="reveal">
            <dl className="relative grid gap-px overflow-hidden rounded-[2rem] bg-royal/10 shadow-[0_40px_80px_-44px_rgb(9_38_75/0.6)] ring-1 ring-royal/10">
              <div className="bg-white p-7">
                <dt className="flex items-center gap-2 label-tech text-teal-500">
                  <Compass className="size-4" aria-hidden /> Industries
                </dt>
                <dd className="mt-4 flex flex-wrap gap-2 [transform:translateZ(30px)]">
                  {INDUSTRIES.map((i) => (
                    <Link
                      key={i.slug}
                      to={`/industries/${i.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3.5 py-1.5 text-sm font-medium text-midnight ring-1 ring-royal/10 transition duration-300 hover:-translate-y-0.5 hover:bg-royal hover:text-white hover:shadow-[0_10px_20px_-10px_rgb(7_59_117/0.8)]"
                    >
                      <i.icon className="size-3.5" aria-hidden /> {i.title}
                    </Link>
                  ))}
                </dd>
              </div>
              <div className="bg-white p-7">
                <dt className="flex items-center gap-2 label-tech text-teal-500">
                  <Layers className="size-4" aria-hidden /> Service lines
                </dt>
                <dd className="mt-2 font-display text-2xl font-bold text-midnight [transform:translateZ(24px)]">Nine services in three groups</dd>
                <dd className="mt-1 text-sm text-steel-700">{SERVICE_GROUPS.map((g) => g.heading).join(' · ')}</dd>
              </div>
              <div className="bg-white p-7">
                <dt className="flex items-center gap-2 label-tech text-teal-500">
                  <Workflow className="size-4" aria-hidden /> Delivery model
                </dt>
                <dd className="mt-2 font-display text-2xl font-bold text-midnight [transform:translateZ(24px)]">Standalone or integrated scope</dd>
                <dd className="mt-1 text-sm text-steel-700">One point of accountability from planning to handover.</dd>
              </div>
            </dl>
          </Tilt3D>
        </Container>
      </AnimatedSection>

      {/* Vision and mission */}
      <AnimatedSection id="vision" className="relative scroll-mt-32 overflow-hidden py-24 md:py-32">
        <Texture variant="glow" />
        <Container className="relative grid gap-8 lg:grid-cols-2">
          {[
            {
              icon: Eye,
              index: '03',
              eyebrow: 'Vision',
              title: <>To be a <em>trusted</em> engineering partner for energy and industry.</>,
              body: 'We aim to be known for safe execution, technical strength and dependable delivery on every scope we take on.',
            },
            {
              icon: Compass,
              index: '04',
              eyebrow: 'Mission',
              title: <>To deliver integrated services that are safe, sound and <em>on time</em>.</>,
              body: 'We combine engineering, construction, maintenance and supply under one roof, develop skilled people and build long-term relationships with the operators we serve.',
            },
          ].map((v) => (
            <Tilt3D key={v.eyebrow} max={7} lift={18} className="h-full rounded-[2rem]" wrapperClassName="reveal h-full">
              <article className="group/card relative isolate flex h-full flex-col overflow-hidden rounded-[2rem] border-metallic surface-metal p-8 md:p-12">
                <Texture variant="lines" />
                <span aria-hidden className="pointer-events-none absolute -bottom-10 -right-4 select-none font-display text-[9rem] font-black leading-none text-white/[0.04] transition-transform duration-700 group-hover/tilt:-translate-x-4">
                  {v.eyebrow.toUpperCase()}
                </span>
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-emerald via-electric to-royal transition-transform duration-700 group-hover/tilt:scale-x-100" />
                <div className="relative flex items-center justify-between [transform:translateZ(30px)]">
                  <p className="flex items-center gap-3">
                    <span className="label-tech text-emerald">{v.index}</span>
                    <span className="h-px w-8 bg-gradient-to-r from-emerald to-transparent" aria-hidden />
                    <span className="font-display font-expanded text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-silver">{v.eyebrow}</span>
                  </p>
                  <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-emerald/10 text-emerald ring-1 ring-emerald/30 transition-transform duration-500 [transform:translateZ(40px)] group-hover/tilt:[transform:translateZ(70px)_rotate(10deg)]">
                    <v.icon className="size-7" aria-hidden />
                  </span>
                </div>
                <h2 className="relative mt-10 text-display-md font-bold text-white [transform:translateZ(50px)]">{v.title}</h2>
                <p className="relative mt-6 leading-relaxed text-steel-300 md:text-lg [transform:translateZ(25px)]">{v.body}</p>
              </article>
            </Tilt3D>
          ))}
        </Container>
      </AnimatedSection>

      <CoreValues />

      <HowWeWork />

      {/* Engineering capabilities */}
      <AnimatedSection id="capabilities" className="theme-light relative scroll-mt-32 overflow-hidden bg-white py-24 md:py-32">
        <Container>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading tone="light" index="07" eyebrow="Engineering capabilities" title={<>Nine service lines, <em>one</em> team.</>} />
            <Link to="/services" className="reveal link-underline inline-flex shrink-0 items-center gap-2 font-semibold text-royal">
              All services <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-14 grid gap-7 lg:grid-cols-3">
            {SERVICE_GROUPS.map((g, gi) => {
              const items = servicesIn(g.slugs)
              return (
                <Tilt3D key={g.heading} max={6} lift={14} className="h-full rounded-[1.75rem]" wrapperClassName="reveal h-full">
                  <div className="h-full rounded-[1.75rem] bg-paper p-7 ring-1 ring-royal/10 transition-shadow duration-500 group-hover/tilt:shadow-[0_40px_70px_-40px_rgb(9_38_75/0.6)]">
                    <div className="relative h-36 [transform-style:preserve-3d]">
                      {items.map((s, n) => (
                        <Picture
                          key={s.slug}
                          src={s.innerImageSmall}
                          alt=""
                          className={cn(
                            'absolute top-0 h-32 w-[58%] rounded-2xl object-cover shadow-[0_20px_40px_-20px_rgb(9_38_75/0.7)] ring-4 ring-white transition-transform duration-700 ease-[var(--ease-out-expo)]',
                            n === 0 && 'left-0 -rotate-6 group-hover/tilt:[transform:translateZ(30px)_rotate(-12deg)_translateX(-8px)]',
                            n === 1 && 'left-[21%] z-10 group-hover/tilt:[transform:translateZ(60px)_translateY(-10px)]',
                            n === 2 && 'left-[42%] rotate-6 group-hover/tilt:[transform:translateZ(30px)_rotate(12deg)_translateX(8px)]',
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-6 label-tech text-teal-500">Group {String(gi + 1).padStart(2, '0')}</p>
                    <h3 className="mt-2 font-display text-2xl font-bold text-midnight">{g.heading}</h3>
                    <p className="mt-2 text-sm text-steel-700">{g.note}</p>
                    <ul className="mt-6 space-y-2">
                      {items.map((s) => (
                        <li key={s.slug}>
                          <Link to={`/services/${s.slug}`} className="group flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-royal/10 transition duration-300 hover:translate-x-1 hover:ring-royal/30">
                            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-electric/[0.08] text-royal transition group-hover:bg-royal group-hover:text-white">
                              <s.icon className="size-4" aria-hidden />
                            </span>
                            <span className="flex-1 text-sm font-semibold text-midnight">{s.title}</span>
                            <ArrowRight className="size-4 text-royal opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Tilt3D>
              )
            })}
          </div>
        </Container>
      </AnimatedSection>

      {/* Capability chapters */}
      <AnimatedSection id="operations" className="scroll-mt-32 py-24 md:py-32">
        <Container>
          <SplitFeature
            index="08"
            eyebrow="Onshore and offshore operations"
            title={<>From desert fields to <em>offshore</em> installations.</>}
            body={[
              'Our crews support oil and gas operations on land and at sea, working within the operator’s permit systems and safety procedures.',
              'Onshore, that means field services, wellsite support and pipelines. Offshore, it means mechanical and maintenance support planned around logistics and weather windows.',
            ]}
            points={['Field and wellsite services', 'Offshore facility support', 'Pipeline and flowline works', 'Remote-site logistics']}
            image="/assets/images/stock/offshore-jackup-crane-vessel.jpg"
            imageSmall="/assets/images/stock/offshore-jackup-crane-vessel-sm.jpg"
            imageAlt="Jack-up rig and crane vessel working offshore"
            caption="Onshore & offshore"
            chip={{ label: 'Environments', value: 'Desert · Coastal · Offshore' }}
            link={{ label: 'Oil & gas industry', href: '/industries/oil-gas' }}
          />
        </Container>
      </AnimatedSection>

      <AnimatedSection id="mechanical" className="theme-light relative scroll-mt-32 overflow-hidden bg-paper py-24 md:py-32">
        <Texture variant="grid-light" />
        <Container className="relative">
          <SplitFeature
            tone="light"
            reverse
            index="09"
            eyebrow="Mechanical engineering"
            title={<>Precision on greenfield and <em>live</em> assets.</>}
            body={[
              'Mechanical works sit at the centre of every facility we support: process piping, rotating and static equipment, fabrication and alignment.',
              'On operating plants, our teams pair craftsmanship with strict isolation and permit discipline.',
            ]}
            points={['Process piping', 'Rotating equipment', 'Static equipment', 'Fabrication and lifting']}
            image="/assets/images/stock/mechanical-flanges-blueprints.jpg"
            imageSmall="/assets/images/stock/mechanical-flanges-blueprints-sm.jpg"
            imageAlt="Machined flanges resting on engineering drawings"
            caption="Mechanical works"
            chip={{ label: 'Discipline', value: 'Rotating & static equipment' }}
            link={{ label: 'Mechanical engineering works', href: '/services/mechanical' }}
          />
        </Container>
      </AnimatedSection>

      <AnimatedSection id="construction" className="scroll-mt-32 py-24 md:py-32">
        <Container>
          <SplitFeature
            index="10"
            eyebrow="Industrial construction"
            title={<>Many disciplines, built in the <em>right order</em>.</>}
            body={[
              'Industrial plants bring civil, steel, mechanical and electromechanical work together in a tight footprint.',
              'We coordinate those trades so construction progresses in sequence and facilities reach commissioning with fewer late surprises.',
            ]}
            points={['Processing facilities', 'Steel structures', 'Storage and tank areas', 'Mechanical completion']}
            image="/assets/images/stock/steel-truss-installation-crew.jpg"
            imageSmall="/assets/images/stock/steel-truss-installation-crew-sm.jpg"
            imageAlt="Crew installing a steel roof truss from an aerial work platform"
            caption="Industrial construction"
            chip={{ label: 'Approach', value: 'Sequenced, multi-trade' }}
            link={{ label: 'Industrial plant construction', href: '/services/industrial-construction' }}
          />
        </Container>
      </AnimatedSection>

      {/* Quality and safety */}
      <AnimatedSection id="hse" className="scroll-mt-32 pb-24 md:pb-32">
        <Container>
          <Tilt3D max={3} lift={10} className="rounded-[2rem]">
            <div className="relative isolate overflow-hidden rounded-[2rem] border-metallic surface-metal">
              <Texture variant="lines" />
              <div className="relative grid lg:grid-cols-[1fr_1.2fr]">
                <div className="relative min-h-72 overflow-hidden lg:min-h-full">
                  <Picture src="/assets/images/about/quality-safety.jpg" small="/assets/images/about/quality-safety-sm.jpg" alt="Personal protective equipment ready for site work" data-parallax className="absolute inset-0 h-full w-full scale-[1.14] object-cover" />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-midnight/10 lg:to-midnight/80" />
                </div>
                <div className="p-8 md:p-14">
                  <SectionHeading index="11" eyebrow="Quality and safety" size="md" title={<>Safety is not a department. It is <em>how we work</em>.</>} />
                  <p className="reveal mt-6 leading-relaxed text-steel-300 md:text-lg">
                    Every job is planned, resourced and run with safety at its centre, and quality is managed so the work is right the first time and
                    auditable afterwards.
                  </p>
                  <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                    {QUALITY.map((q) => (
                      <li key={q} className="reveal flex items-start gap-2.5 rounded-xl bg-white/[0.04] p-3 text-sm text-steel-200 ring-1 ring-white/5 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald/10 hover:ring-emerald/30">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald" aria-hidden /> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Tilt3D>
        </Container>
      </AnimatedSection>

      <AboutFaq items={ABOUT_FAQ} />
    </div>
  )
}

