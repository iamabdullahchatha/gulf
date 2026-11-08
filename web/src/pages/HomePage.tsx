import { CinematicFilm } from '@/components/hero/CinematicFilm'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { Marquee } from '@/components/Marquee'
import { ReservoirSection } from '@/components/home/ReservoirSection'
import { RefineryVideoSection } from '@/components/home/RefineryVideoSection'
import { ServicesShowcase } from '@/components/home/ServicesShowcase'
import { IndustriesShowcase } from '@/components/home/IndustriesShowcase'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { ContactCTA } from '@/components/home/ContactCTA'
import { FaqShowcase } from '@/components/home/FaqShowcase'
import { PageProgress } from '@/components/home/PageProgress'
import { Seo, organizationJsonLd } from '@/lib/seo'
import { FILM_SCENES } from '@/data/homeChapters'

/**
 * Homepage.
 *
 * 1. The film — the six approved scenes (01, 02, 03, 04, 05, 09) as one
 *    continuous scroll-driven sequence, words synced to the footage.
  * 2. Numbered editorial chapters that alternate a vivid blue band with bright
 *    white and paper sections:
 *    01 Reservoir (blue) · 02 Refinery (full-screen film) · 03 Services (paper) ·
 *    04 Industries (white) · 05 Why GULF NEXT (paper) · 06 FAQs (white) ·
 *    07 Contact (photo + brand blue)
 */
export default function HomePage() {
  return (
    <>
      <Seo
        description="Integrated Oil & Gas Contracting, Industrial Engineering and Infrastructure Solutions — engineering the energy future."
        path="/"
        jsonLd={organizationJsonLd()}
      />
      <PageProgress />

      <CinematicFilm scenes={FILM_SCENES} skipTo="reservoir" />

      <div className="relative z-10 border-y border-white/10 bg-[linear-gradient(90deg,#073b75,#0b4c93,#073b75)]">
        <Marquee items={['Oil & gas contracting', 'Industrial engineering', 'Infrastructure', 'Upstream', 'Offshore', 'Facilities & pipelines', 'Turnarounds', 'HSE & quality']} />
      </div>

      <ReservoirSection />
      <RefineryVideoSection />
      <ServicesShowcase />

      <AnimatedSection as="div">
        <IndustriesShowcase />
      </AnimatedSection>

      <AnimatedSection as="div">
        <WhyChooseUs />
      </AnimatedSection>

      <AnimatedSection as="div">
        <FaqShowcase />
      </AnimatedSection>

      <ContactCTA />
    </>
  )
}
