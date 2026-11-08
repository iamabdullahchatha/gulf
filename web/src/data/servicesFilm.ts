/**
 * The Services page hero: Scene 11 played as a scroll-driven shot, with each
 * beat pinned to the seconds of footage it describes:
 *   0–2.1 pipeline corridor into the refinery at dusk ·
 *   2.1–4.1 a crawler crane lifting a steel module into place ·
 *   4.1–6.1 two engineers checking a valve station against drawings ·
 *   6.1–8 aerial of the finished plant at dusk.
 */
import type { FilmHero } from '@/components/hero/CinematicFilm'
import type { FilmScene } from '@/data/homeChapters'

export const SERVICES_HERO: FilmHero = {
  eyebrow: 'Services',
  words: ['ENGINEERED', 'CAPABILITIES.', 'INTEGRATED', 'SOLUTIONS.'],
  metallic: 'SOLUTIONS.',
  fontSize: 'clamp(2rem, 5.6vw, 5.2rem)',
  ctas: [
    { label: 'Explore services', href: '#service-lines' },
    { label: 'Send an inquiry', href: '/contact' },
  ],
}

export const SERVICES_FINALE = [
  { label: 'Browse the nine service lines', href: '#service-lines' },
  { label: 'Send an inquiry', href: '/contact' },
]

export const SERVICES_FILM: FilmScene[] = [
  {
    id: 'services-film',
    index: '01',
    section: 'services.hero',
    label: 'Services',
    align: 'center',
    beats: [
      { from: 0, to: 2.1, title: 'Engineered capabilities. Integrated solutions.', body: 'Nine service lines covering the field, the plant and the full asset lifecycle.' },
      { from: 2.1, to: 4.1, align: 'left', title: 'Structures, lifted into place.', accent: 'lifted into place', body: 'Steel structures, modules and mechanical packages installed in sequence, with lifts planned before the crane arrives.' },
      { from: 4.1, to: 6.1, align: 'left', title: 'Checked against the drawings.', accent: 'the drawings', body: 'Engineers on site verify every connection, valve and test before a system is handed back.' },
      { from: 6.1, to: 8.1, title: 'One scope. One point of accountability.', accent: 'accountability', body: 'Deliver a single service, or combine several into one coordinated package.' },
    ],
  },
]
