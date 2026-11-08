import { Navigate, useParams } from 'react-router'
import { Container } from '@/components/Container'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { SectionHeading } from '@/components/SectionHeading'
import { Texture } from '@/components/Texture'
import { CheckList, PageNav, SiblingPager } from '@/components/inner/InnerSections'
import { AboutFaq } from '@/components/about/AboutSections'
import { DeliveryTimeline, FocusPanels, IndustryHero, SectorGlance, SectorServices } from '@/components/industries/IndustryDetailSections'
import { Seo } from '@/lib/seo'
import { INDUSTRIES, findIndustry } from '@/data/industries'
import { servicesForIndustry } from '@/data/services'

const NAV = [
  { id: 'overview', label: 'Overview & capabilities' },
  { id: 'focus', label: 'Focus areas' },
  { id: 'services', label: 'Relevant services' },
  { id: 'delivery', label: 'How we deliver' },
  { id: 'faq', label: 'FAQs' },
]

const MODEL = [
  { title: 'Scope', desc: 'Objectives, constraints and risks agreed with your team before anything is priced.' },
  { title: 'Plan', desc: 'Resources, permits and mobilisation sequenced around your operating window.' },
  { title: 'Execute', desc: 'Named supervisors, daily reporting and stop-work authority for everyone on site.' },
  { title: 'Hand over', desc: 'Records completed, punch lists closed and a clean transfer back to operations.' },
]

/**
 * Industry detail: louvre-slat photo hero, overview, focus areas as
 * expanding photo panels, an editorial list of the relevant services, the
 * sector's capabilities beside an orbiting emblem, and FAQs. Photos are the
 * sector's own inner image and "in the field" set, shared with no other page.
 */
export default function IndustryDetailPage() {
  const { slug = '' } = useParams()
  const industry = findIndustry(slug)
  if (!industry) return <Navigate to="/industries" replace />

  const idx = INDUSTRIES.findIndex((i) => i.slug === slug)
  const prev = INDUSTRIES[(idx - 1 + INDUSTRIES.length) % INDUSTRIES.length]!
  const next = INDUSTRIES[(idx + 1) % INDUSTRIES.length]!
  const services = servicesForIndustry(industry.slug)
  const others = INDUSTRIES.filter((i) => i.slug !== industry.slug)

  return (
    <div key={industry.slug}>
      <Seo
        title={industry.title}
        description={industry.description}
        path={`/industries/${industry.slug}`}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: industry.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }}
      />

      <IndustryHero industry={industry} total={INDUSTRIES.length} services={services} />

      <PageNav items={NAV} />

      {/* Overview */}
      <AnimatedSection id="overview" className="relative scroll-mt-32 overflow-hidden py-24 md:py-32">
        <div aria-hidden className="absolute -left-40 top-10 size-[30rem] rounded-full bg-emerald/10 blur-3xl" />
        <Container className="relative grid items-start gap-14 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
          <div>
            <SectionHeading index="01" eyebrow="Overview" size="md" title={<>{industry.short.replace(/\.$/, '')}<em>.</em></>} />
            <div className="mt-10 border-l-2 border-emerald/40 pl-6">
              {industry.overview.map((p, i) => (
                <p key={p} className={i === 0 ? 'reveal text-xl leading-relaxed text-steel-200 md:text-[1.4rem] md:leading-[1.6]' : 'reveal mt-6 text-lg leading-relaxed text-steel-400'}>{p}</p>
              ))}
            </div>
            <div id="capabilities" className="mt-16 scroll-mt-40">
              <p className="reveal flex items-center gap-3">
                <span className="label-tech text-emerald">Capabilities</span>
                <span className="h-px flex-1 bg-gradient-to-r from-emerald/50 to-transparent" aria-hidden />
              </p>
              <h3 className="reveal mt-4 font-display text-2xl font-bold text-white md:text-3xl">
                What we bring to <em>the sector</em>.
              </h3>
              <CheckList items={industry.capabilities} className="mt-8" />
            </div>
          </div>
          <div className="lg:sticky lg:top-36">
            <SectorGlance industry={industry} services={services} others={others} />
          </div>
        </Container>
      </AnimatedSection>

      {/* Focus areas */}
      <AnimatedSection id="focus" className="relative scroll-mt-32 overflow-hidden bg-deep py-24 md:py-32">
        <Texture variant="grid" />
        <Container className="relative">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading index="02" eyebrow="Focus areas" title={<>Where we <em>focus</em> in this sector.</>} />
            <p className="reveal hidden max-w-md text-steel-400 lg:block lg:text-right">Hover a panel to open it.</p>
          </div>
          <FocusPanels industry={industry} />
        </Container>
      </AnimatedSection>

      {/* Relevant services */}
      <AnimatedSection id="services" className="theme-light relative scroll-mt-32 overflow-hidden bg-white py-24 md:py-32">
        <Texture variant="grid-light" />
        <Container className="relative">
          <SectionHeading tone="light" index="03" eyebrow="Relevant services" title={<>How we support <em>{industry.title.toLowerCase()}</em>.</>} />
          <SectorServices industry={industry} />
        </Container>
      </AnimatedSection>

      {/* Delivery */}
      <AnimatedSection id="delivery" className="theme-light relative scroll-mt-32 overflow-hidden bg-paper py-24 md:py-32">
        <Texture variant="grid-light" />
        <Texture variant="glow-light" />
        <Container className="relative">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading tone="light" index="04" eyebrow="How we deliver" title={<>One delivery model, <em>sector-aware</em> teams.</>} />
            <p className="reveal max-w-md text-steel-700 lg:text-right">The same four steps on every scope, planned around the hazards and constraints of {industry.title.toLowerCase()}.</p>
          </div>
          <DeliveryTimeline steps={MODEL} />
        </Container>
      </AnimatedSection>

      <AboutFaq
        items={industry.faqs.map((f) => ({ ...f, topic: industry.title }))}
        index="05"
        title={<>Questions about this <em>sector</em>.</>}
        lead={`Common questions about our work in ${industry.title.toLowerCase()}.`}
        moreHref="/faqs#topic-industries"
      />

      <section className="bg-deep pb-24 md:pb-28">
        <Container>
          <SiblingPager
            kind="industry"
            prev={{ href: `/industries/${prev.slug}`, title: prev.title, icon: prev.icon, index: prev.index }}
            next={{ href: `/industries/${next.slug}`, title: next.title, icon: next.icon, index: next.index }}
          />
        </Container>
      </section>
    </div>
  )
}
