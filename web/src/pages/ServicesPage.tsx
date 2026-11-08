import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { CinematicFilm } from '@/components/hero/CinematicFilm'
import { Container } from '@/components/Container'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { Marquee } from '@/components/Marquee'
import { SectionHeading } from '@/components/SectionHeading'
import { Texture } from '@/components/Texture'
import { ProcessSteps } from '@/components/inner/InnerSections'
import { AboutFaq } from '@/components/about/AboutSections'
import { IndustryTile, LifecycleHub, ServiceDeck, ServiceGroups } from '@/components/services/ServicesSections'
import { Seo } from '@/lib/seo'
import { SERVICES, SERVICE_GROUPS, servicesIn } from '@/data/services'
import { INDUSTRIES } from '@/data/industries'
import type { FaqItem } from '@/data/faq'
import { SERVICES_FILM, SERVICES_FINALE, SERVICES_HERO } from '@/data/servicesFilm'

const MODEL = [
  { title: 'Scope', desc: 'Objectives, constraints and risks agreed with your team before anything is priced.' },
  { title: 'Plan', desc: 'Resources, permits and mobilisation sequenced around your operating window.' },
  { title: 'Execute', desc: 'Named supervisors, daily reporting and stop-work authority for everyone on site.' },
  { title: 'Hand over', desc: 'Records completed, punch lists closed and a clean transfer back to operations.' },
]

/** One question from each service, grouped by service group for the topic filter. */
const SERVICES_FAQ: FaqItem[] = SERVICE_GROUPS.flatMap((g) =>
  servicesIn(g.slugs).flatMap((s) => (s.faqs[0] ? [{ ...s.faqs[0], topic: g.heading }] : [])),
)

/**
 * Services: Scene 11 played as a scroll-driven film, the nine service lines
 * as a 3D deck, the three service groups, the lifecycle hub, the shared
 * delivery model, the industries served and a filterable FAQ.
 */
export default function ServicesPage() {
  return (
    <>
      <Seo
        title="Services"
        description="Nine integrated service lines for oil, gas, petrochemical and industrial facilities, from field services and pipelines to mechanical works, construction, maintenance and supply."
        path="/services"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: SERVICES_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />

      <CinematicFilm
        scenes={SERVICES_FILM}
        skipTo="service-lines"
        hero={SERVICES_HERO}
        finale={SERVICES_FINALE}
        segment={320}
        ease={0.16}
        label="GULF NEXT services: engineered capabilities, integrated solutions"
      />

      <div className="border-y border-silver/10 bg-deep py-5">
        <Marquee items={SERVICES.map((s) => s.title)} />
      </div>

      <ServiceDeck />

      <ServiceGroups />

      <LifecycleHub />

      {/* Delivery model */}
      <AnimatedSection id="delivery" className="theme-light relative scroll-mt-32 overflow-hidden bg-white py-24 md:py-32">
        <Texture variant="grid-light" />
        <Container className="relative">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading tone="light" index="04" eyebrow="How we work" title={<>One delivery model across <em>every</em> service.</>} />
            <p className="reveal max-w-md text-steel-700 lg:text-right">The same four steps whether the scope is a single shutdown task or a complete plant package.</p>
          </div>
          <ProcessSteps steps={MODEL} tone="light" />
        </Container>
      </AnimatedSection>

      {/* Industries served */}
      <AnimatedSection id="industries" className="relative scroll-mt-32 overflow-hidden bg-midnight py-24 md:py-32">
        <Texture variant="grid" />
        <div aria-hidden className="absolute -right-40 top-10 size-[34rem] rounded-full bg-electric/10 blur-3xl" />
        <Container className="relative">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading index="05" eyebrow="Industries served" title={<>Services shaped by <em>sector</em>.</>} />
            <Link to="/industries" className="reveal link-underline inline-flex shrink-0 items-center gap-2 font-semibold text-white">
              All industries <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-14 grid gap-6 [perspective:1600px] sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRIES.map((ind) => (
              <div key={ind.slug} className="reveal">
                <IndustryTile industry={ind} />
              </div>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      <AboutFaq
        items={SERVICES_FAQ}
        index="06"
        title={<>Questions about our <em>services</em>.</>}
        lead="One common question from each service line. Each service page answers more."
      />
    </>
  )
}
