import { CinematicFilm } from '@/components/hero/CinematicFilm'
import { AboutFaq } from '@/components/about/AboutSections'
import { NotListedBand, SectorConnections, SectorPanorama, StandardsFlip } from '@/components/industries/IndustriesSections'
import { PAGE_META } from '@/config/site'
import { Seo } from '@/lib/seo'
import { INDUSTRIES } from '@/data/industries'
import type { FaqItem } from '@/data/faq'
import { INDUSTRIES_FILM, INDUSTRIES_FINALE, INDUSTRIES_HERO } from '@/data/industriesFilm'

/** One question from each sector, filterable by sector. */
const INDUSTRIES_FAQ: FaqItem[] = INDUSTRIES.flatMap((ind) => ind.faqs.slice(0, 2).map((f) => ({ ...f, topic: ind.title })))

/**
 * Industries: Scene 12 played as a scroll-driven film that visits each
 * sector, a horizontal sector panorama, an interactive services-by-sector
 * map, flip cards for the cross-sector standards, an "other sectors" band
 * and a sector-filtered FAQ.
 */
export default function IndustriesPage() {
  return (
    <>
      <Seo
        title={PAGE_META['/industries'].title}
        description={PAGE_META['/industries'].description}
        path="/industries"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: INDUSTRIES_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />

      <CinematicFilm
        scenes={INDUSTRIES_FILM}
        skipTo="sectors"
        hero={INDUSTRIES_HERO}
        finale={INDUSTRIES_FINALE}
        segment={400}
        ease={0.16}
        label="GULF NEXT industries: supporting the industries that move the world"
      />

      <SectorPanorama />

      <SectorConnections />

      <StandardsFlip />

      <NotListedBand />

      <AboutFaq
        items={INDUSTRIES_FAQ}
        index="04"
        title={<>Questions by <em>sector</em>.</>}
        lead="Common questions from each sector we serve. Each sector page answers more."
      />
    </>
  )
}
