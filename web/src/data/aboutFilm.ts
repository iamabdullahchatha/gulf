/**
 * The About page hero: Scene 10 played as a scroll-driven shot, with each
 * beat pinned to the seconds of footage it describes:
 *   0–2.3 pipeline corridor at night · 2.3–4.1 modules under crawler cranes ·
 *   4.1–6.1 two engineers reviewing a valve station · 6.1–8 aerial of the plant.
 */
import type { FilmHero } from '@/components/hero/CinematicFilm'
import type { FilmScene } from '@/data/homeChapters'

export const ABOUT_HERO: FilmHero = {
  eyebrow: 'About GULF NEXT',
  words: ['ENGINEERING', 'STRENGTH.', 'BUILDING', 'TRUST.'],
  metallic: 'TRUST.',
  fontSize: 'clamp(2.1rem, 6vw, 5.6rem)',
  ctas: [
    { label: 'Our services', href: '/services' },
    { label: 'Contact us', href: '/contact' },
  ],
}

export const ABOUT_FINALE = [
  { label: 'Explore our services', href: '/services' },
  { label: 'Industries we serve', href: '/industries' },
]

export const ABOUT_FILM: FilmScene[] = [
  {
    id: 'about-film',
    index: '01',
    section: 'about.hero',
    label: 'Who we are',
    align: 'center',
    beats: [
      { from: 0, to: 2.3, title: 'Engineering strength. Building trust.', body: 'An engineering and industrial services partner for oil, gas, petrochemical and industrial facilities.' },
      { from: 2.3, to: 4.1, align: 'left', title: 'Built to plan, lifted into place.', accent: 'lifted into place', body: 'Steel structures, modules and mechanical packages installed in the right sequence, and safely.' },
      { from: 4.1, to: 6.1, align: 'left', title: 'People who know the field.', accent: 'the field', body: 'Engineers and supervisors who plan the work, check it and stand behind it.' },
      { from: 6.1, to: 8.1, title: 'One partner, from concept to operation.', accent: 'operation', body: 'Field services, construction, maintenance and supply under a single point of accountability.' },
    ],
  },
]
