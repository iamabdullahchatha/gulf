/**
 * The Industries page hero: Scene 12 played as a scroll-driven shot. The
 * footage visits each sector in turn, so every beat introduces the sector on
 * screen:
 *   0–1.9 offshore platform (headline, then Oil & Gas) ·
 *   1.9–3.9 process plant columns and pipe racks (Petrochemical) ·
 *   3.9–6.1 crane lifting a beam onto a steel structure (Construction) ·
 *   6.1–8 compressor hall (Mechanical Engineering & Equipment).
 */
import type { FilmHero } from '@/components/hero/CinematicFilm'
import type { FilmScene } from '@/data/homeChapters'

export const INDUSTRIES_HERO: FilmHero = {
  eyebrow: 'Industries',
  words: ['SUPPORTING', 'THE', 'INDUSTRIES', 'THAT', 'MOVE', 'THE', 'WORLD.'],
  metallic: 'WORLD.',
  fontSize: 'clamp(2rem, 5.4vw, 5rem)',
  ctas: [
    { label: 'Explore industries', href: '#sectors' },
    { label: 'Our services', href: '/services' },
  ],
}

export const INDUSTRIES_FINALE = [
  { label: 'Explore the four sectors', href: '#sectors' },
  { label: 'Discuss a project', href: '/contact' },
]

export const INDUSTRIES_FILM: FilmScene[] = [
  {
    id: 'industries-film',
    index: '01',
    section: 'industries.hero',
    label: 'Industries',
    align: 'center',
    beats: [
      { from: 0, to: 0.95, title: 'Supporting the industries that move the world.', body: 'Energy and industrial facilities each bring their own demands. We bring integrated services and teams who understand them.' },
      { from: 0.95, to: 1.9, align: 'left', title: 'Oil & gas, onshore and offshore.', accent: 'onshore and offshore', body: 'Field services, wellsite support, pipelines and maintenance for production in demanding environments.' },
      { from: 1.9, to: 3.9, align: 'left', title: 'Petrochemical & processing.', accent: 'processing', body: 'Mechanical, piping and maintenance support for refineries, gas processing and petrochemical plants.' },
      { from: 3.9, to: 6.1, align: 'left', title: 'Industrial construction & infrastructure.', accent: 'infrastructure', body: 'Plant construction, steel structures and electromechanical systems, built in the right sequence.' },
      { from: 6.1, to: 8.1, title: 'Mechanical engineering & equipment.', accent: 'equipment', body: 'Rotating and static equipment installed, maintained and supplied through the asset lifecycle.' },
    ],
  },
]
