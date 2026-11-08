import { Navigate, useParams } from 'react-router'
import { Container } from '@/components/Container'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { FAQAccordion } from '@/components/FAQAccordion'
import { SectionHeading } from '@/components/SectionHeading'
import { Texture } from '@/components/Texture'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { CheckList, PageNav, ProcessSteps, ScopeGrid, SiblingPager } from '@/components/inner/InnerSections'
import { EquipmentPanel, FieldTriptych, ServiceHero } from '@/components/services/ServiceDetailSections'
import { IndustryTile, ServiceTile } from '@/components/services/ServicesSections'
import { Seo, organizationJsonLd } from '@/lib/seo'
import { SERVICES, findService, servicesIn } from '@/data/services'
import { INDUSTRIES } from '@/data/industries'
import { cn } from '@/lib/cn'

const NAV = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'scope', label: 'Scope' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'approach', label: 'Approach' },
  { id: 'industries', label: 'Industries' },
  { id: 'related', label: 'Related services' },
  { id: 'faq', label: 'FAQs' },
]

/**
 * Service detail. Every photograph on the page is this service's own inner
 * image (hero frame and field triptych), so no two service pages share a
 * photo; related services and industries are shown as photo-free 3D tiles.
 */
export default function ServiceDetailPage() {
  const { slug = '' } = useParams()
  const service = findService(slug)
  if (!service) return <Navigate to="/services" replace />

  const idx = SERVICES.findIndex((s) => s.slug === slug)
  const prev = SERVICES[(idx - 1 + SERVICES.length) % SERVICES.length]!
  const next = SERVICES[(idx + 1) % SERVICES.length]!
  const Icon = service.icon
  const industries = INDUSTRIES.filter((i) => service.industries.includes(i.slug))
  const related = servicesIn(service.related)

  return (
    <div key={service.slug}>
      <Seo
        title={service.title}
        description={service.description}
        path={`/services/${service.slug}`}
        jsonLd={[
          { '@context': 'https://schema.org', '@type': 'Service', name: service.title, description: service.description, provider: organizationJsonLd() },
          { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: service.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
        ]}
      />

      <ServiceHero service={service} total={SERVICES.length} industries={industries} />

      <PageNav items={NAV} />

      {/* Introduction */}
      <AnimatedSection id="introduction" className="relative scroll-mt-32 overflow-hidden py-24 md:py-32">
        <div aria-hidden className="absolute -right-40 top-0 size-[32rem] rounded-full bg-electric/10 blur-3xl" />
        <Container className="relative grid items-start gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <SectionHeading index="01" eyebrow="Introduction" size="md" title={<>{service.short.replace(/\.$/, '')}<em>.</em></>} />
            {service.intro.map((p) => (
              <p key={p} className="reveal mt-6 text-lg leading-relaxed text-steel-400">{p}</p>
            ))}
          </div>
          <div className="reveal space-y-4 lg:sticky lg:top-40 [perspective:1400px]">
            <p className="label-tech text-steel-500">What the scope covers</p>
            {service.scope.slice(0, 4).map((it, i) => (
              <Tilt3D key={it.title} max={8} lift={14} className="rounded-2xl">
                <div
                  className="flex items-center gap-4 rounded-2xl glass p-4 transition-colors duration-500 group-hover/tilt:bg-royal/30"
                  style={{ marginLeft: `${i * 1.25}rem` }}
                >
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-royal font-mono text-sm text-white [transform:translateZ(40px)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-semibold text-white">{it.title}</span>
                  <Icon className="ml-auto size-4 shrink-0 text-emerald" aria-hidden />
                </div>
              </Tilt3D>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      {/* Scope */}
      <AnimatedSection id="scope" className="theme-light relative scroll-mt-32 overflow-hidden bg-paper py-24 md:py-32">
        <Texture variant="grid-light" />
        <Container className="relative">
          <SectionHeading tone="light" index="02" eyebrow="Scope of service" title={<>What this service <em>covers</em>.</>} lead="Each item can be delivered on its own or combined into a wider scope with other GULF NEXT services." />
          <ScopeGrid items={service.scope} icon={Icon} />
        </Container>
      </AnimatedSection>

      <FieldTriptych service={service} />

      {/* Capabilities and equipment */}
      <AnimatedSection id="capabilities" className="relative scroll-mt-32 overflow-hidden bg-deep py-24 md:py-32">
        <Texture variant="grid" />
        <Container className="relative grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <SectionHeading index="03" eyebrow="Relevant capabilities" size="md" title={<>How we <em>deliver</em> it.</>} />
            <CheckList items={service.capabilities} className="mt-10" />
          </div>
          <EquipmentPanel service={service} />
        </Container>
      </AnimatedSection>

      {/* Execution approach */}
      <AnimatedSection id="approach" className="theme-light relative scroll-mt-32 overflow-hidden bg-white py-24 md:py-32">
        <Texture variant="grid-light" />
        <Container className="relative">
          <SectionHeading tone="light" index="05" eyebrow="Execution approach" align="center" title={<>A delivery rhythm you can <em>plan around</em>.</>} />
          <ProcessSteps steps={service.approach} tone="light" />
        </Container>
      </AnimatedSection>

      {/* Related industries */}
      <AnimatedSection id="industries" className="relative scroll-mt-32 overflow-hidden bg-midnight py-24 md:py-32">
        <Texture variant="glow" />
        <Container className="relative">
          <SectionHeading index="06" eyebrow="Related industries" title={<>Where this service <em>applies</em>.</>} />
          <div className={cn('mt-14 grid gap-6 [perspective:1600px] md:grid-cols-2', industries.length > 2 && 'lg:grid-cols-3', industries.length > 3 && 'lg:grid-cols-4')}>
            {industries.map((ind) => (
              <div key={ind.slug} className="reveal">
                <IndustryTile industry={ind} />
              </div>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      {/* Related services */}
      <AnimatedSection id="related" className="theme-light relative scroll-mt-32 overflow-hidden bg-paper py-24 md:py-32">
        <Texture variant="glow-light" />
        <Container className="relative">
          <SectionHeading tone="light" index="07" eyebrow="Related services" title={<>Often delivered <em>together</em>.</>} />
          <div className="mt-14 grid gap-6 [perspective:1600px] md:grid-cols-3">
            {related.map((s) => (
              <div key={s.slug} className="reveal">
                <ServiceTile service={s} tone="light" />
              </div>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      {/* FAQs */}
      <AnimatedSection id="faq" className="scroll-mt-32 py-24 md:py-32">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div className="lg:sticky lg:top-40 lg:self-start">
            <SectionHeading index="08" eyebrow="FAQs" size="md" title={<>Questions about this <em>service</em>.</>} />
          </div>
          <div className="reveal">
            <FAQAccordion items={service.faqs} />
          </div>
        </Container>
      </AnimatedSection>

      <section className="pb-24 md:pb-28">
        <Container>
          <SiblingPager
            kind="service"
            prev={{ href: `/services/${prev.slug}`, title: prev.title, icon: prev.icon, index: prev.index }}
            next={{ href: `/services/${next.slug}`, title: next.title, icon: next.icon, index: next.index }}
          />
        </Container>
      </section>
    </div>
  )
}
