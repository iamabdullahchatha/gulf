import { useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'
import { ServiceCard3D } from '@/components/cards/ServiceCard3D'
import { Texture } from '@/components/Texture'
import { SERVICES } from '@/data/services'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Services overview (light): six 3D photo cards that flip up into place. */
export function ServicesShowcase() {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      gsap.from('[data-card]', {
        rotateX: -38,
        y: 90,
        z: -120,
        opacity: 0,
        transformOrigin: '50% 100%',
        duration: 1.3,
        ease: 'expo.out',
        stagger: 0.09,
        scrollTrigger: { trigger: '[data-grid]', start: 'top 82%', once: true },
      })
      gsap.from('[data-head] > *', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '[data-head]', start: 'top 85%', once: true },
      })
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section ref={ref} id="services" className="theme-light relative overflow-hidden bg-paper py-28 md:py-36" aria-label="Services">
      <Texture variant="grid-light" />
      <Texture variant="glow-light" />
      <Container className="relative">
        <div data-head className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            reveal={false}
            tone="light"
            index="03"
            eyebrow="Services"
            title={<>Nine disciplines. <em>One</em> point of accountability.</>}
            lead="Each capability can be delivered on its own or combined into a single integrated scope."
          />
          <Link to="/services" className="link-underline inline-flex shrink-0 items-center gap-2 font-semibold text-royal">
            All services <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div data-grid className="mt-16 grid gap-6 [perspective:1600px] sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.slug} data-card>
              <ServiceCard3D service={s} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
