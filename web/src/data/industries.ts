/**
 * Industries catalogue: the four sectors surfaced by the Industries index,
 * the homepage showcase, the mega menu and the detail routes under
 * /industries/:slug. Related services are derived from `services.ts`.
 * Photos follow the convention /assets/images/industries/{slug}[-inner][-sm].jpg.
 */
import { Cog, Factory, Flame, HardHat } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FaqItem } from '@/data/faq'

export interface Industry {
  slug: string
  /** Media-catalogue key whose scene video plays in this industry's hero. */
  imageKey: string
  image: string
  imageSmall: string
  innerImage: string
  innerImageSmall: string
  index: string
  icon: LucideIcon
  title: string
  short: string
  description: string
  /** Three short operating-context labels for cards and the mega menu. */
  context: string[]
  overview: string[]
  focus: { title: string; desc: string }[]
  capabilities: string[]
  /** Four licensed stock photographs for the "In the field" gallery. */
  gallery: { src: string; small: string; alt: string }[]
  faqs: FaqItem[]
}

type IndustryInput = Omit<Industry, 'image' | 'imageSmall' | 'innerImage' | 'innerImageSmall' | 'index' | 'gallery'> & {
  /** Stock names (media/stock-photos.json) replacing the default slug-named photos. */
  photo?: { card?: string; inner?: string }
  gallery: [string, string][]
}

const DIR = '/assets/images/industries'
const STOCK = '/assets/images/stock'
const stock = (name: string, size = '') => `${STOCK}/${name}${size}.jpg`

function industry(n: number, { photo, gallery, ...i }: IndustryInput): Industry {
  return {
    ...i,
    index: String(n).padStart(2, '0'),
    image: photo?.card ? stock(photo.card) : `${DIR}/${i.slug}.jpg`,
    imageSmall: photo?.card ? stock(photo.card, '-sm') : `${DIR}/${i.slug}-sm.jpg`,
    innerImage: photo?.inner ? stock(photo.inner) : `${DIR}/${i.slug}-inner.jpg`,
    innerImageSmall: photo?.inner ? stock(photo.inner, '-sm') : `${DIR}/${i.slug}-inner-sm.jpg`,
    gallery: gallery.map(([name, alt]) => ({ src: stock(name), small: stock(name, '-sm'), alt })),
  }
}

export const INDUSTRIES: Industry[] = [
  industry(1, {
    slug: 'oil-gas',
    gallery: [
      ['land-drilling-rig', 'Land drilling rig on an onshore wellsite'],
      ['offshore-platform-silhouette', 'Offshore production platform at dusk'],
      ['twin-pipeline-corridor', 'Twin pipelines running through a valley'],
      ['onshore-oilfield-pumpjacks', 'Onshore oilfield with pumpjacks'],
    ],
    imageKey: 'scene-03',
    icon: Flame,
    title: 'Oil & Gas',
    short: 'Onshore fields, offshore facilities and the pipelines that connect them.',
    description:
      'Field services, wellsite support, pipelines and maintenance for onshore and offshore oil and gas operations.',
    context: ['Onshore fields and gathering', 'Offshore installations', 'Pipelines and flowlines'],
    overview: [
      'Oil and gas operations run in demanding environments, from desert fields to offshore installations. Work has to fit around production, weather windows and strict safety systems.',
      'GULF NEXT supports operators and contractors across the upstream chain with field services, wellsite support, pipeline works and maintenance, delivered under the operator’s procedures.',
    ],
    focus: [
      { title: 'Onshore production', desc: 'Field support, wellsite works and gathering facilities.' },
      { title: 'Offshore installations', desc: 'Mechanical and maintenance support for offshore facilities.' },
      { title: 'Pipelines and flowlines', desc: 'Construction, tie-ins and repair of oil and gas lines.' },
      { title: 'Field maintenance', desc: 'Planned and corrective maintenance for field equipment.' },
    ],
    capabilities: [
      'Crews for onshore and offshore locations',
      'Wellsite and rig-site support',
      'Pipeline and flowline construction',
      'Live-plant tie-ins under permit',
      'Remote-site logistics',
      'Safety-led supervision',
    ],
    faqs: [
      { q: 'Do you support both onshore and offshore work?', a: 'Yes. Our services are organised for both onshore fields and offshore installations.' },
      { q: 'Can you work under our safety management system?', a: 'Yes. Our teams work under the operator’s permit-to-work and site safety procedures.' },
      { q: 'Which services are most relevant to oil and gas?', a: 'Field services, wellsite support, pipeline works and maintenance are the most common, with mechanical and supply scopes alongside.' },
    ],
  }),
  industry(2, {
    slug: 'petrochemical',
    gallery: [
      ['petrochemical-complex-night', 'Petrochemical complex lit at night'],
      ['gas-processing-spheres', 'Spherical gas storage tanks at a processing plant'],
      ['gas-flare-stack', 'Flare stack at a gas processing facility'],
      ['refinery-dusk-waterfront', 'Waterfront refinery at dusk'],
    ],
    imageKey: 'refinery',
    icon: Factory,
    title: 'Petrochemical & Processing',
    short: 'Refineries, gas processing and petrochemical plants.',
    description:
      'Mechanical works, plant construction and turnaround support for refineries, gas processing and petrochemical facilities.',
    context: ['Refineries and process units', 'Gas processing plants', 'Turnarounds and revamps'],
    overview: [
      'Processing plants combine high-energy systems with complex mechanical equipment. Work often takes place alongside operating units, where planning and isolation discipline are essential.',
      'GULF NEXT supports processing facilities with mechanical works, construction, electromechanical scopes and turnaround execution.',
    ],
    focus: [
      { title: 'Refining', desc: 'Mechanical and maintenance scopes for refinery units.' },
      { title: 'Gas processing', desc: 'Piping, equipment and construction support for gas plants.' },
      { title: 'Petrochemical plants', desc: 'Installation and maintenance support for process equipment.' },
      { title: 'Turnarounds', desc: 'Resourcing and execution of shutdown work packs.' },
    ],
    capabilities: [
      'Process piping and equipment installation',
      'Turnaround and shutdown execution',
      'Brownfield work alongside operating units',
      'Electromechanical installation',
      'Structural steel for plant expansions',
      'Mechanical completion records',
    ],
    faqs: [
      { q: 'Do you work inside operating plants?', a: 'Yes. We execute scopes alongside operating units under the plant’s isolation and permit procedures.' },
      { q: 'Can you support turnarounds?', a: 'Yes. Turnaround resourcing and execution is one of our core services for processing plants.' },
      { q: 'Do you support plant expansions?', a: 'Yes. We provide construction, steel and mechanical scopes for brownfield expansions.' },
    ],
  }),
  industry(3, {
    slug: 'construction',
    photo: { inner: 'steel-frame-tower-cranes' },
    gallery: [
      ['excavator-heavy-equipment', 'Excavator on site preparation and earthworks'],
      ['industrial-infrastructure-coastal', 'Coastal industrial infrastructure'],
      ['refinery-storage-tanks', 'Storage tanks at an industrial plant'],
      ['heavy-lift-crane-vessel', 'Heavy-lift crane vessel at sea'],
    ],
    imageKey: 'scene-04',
    icon: HardHat,
    title: 'Industrial Construction & Infrastructure',
    short: 'Industrial plants, utilities and supporting infrastructure.',
    description:
      'Multi-discipline construction for industrial plants, utilities and energy infrastructure, coordinated under one point of accountability.',
    context: ['Industrial plants', 'Utilities and power', 'Storage and infrastructure'],
    overview: [
      'Industrial and energy infrastructure needs civil, steel, mechanical and electromechanical work to come together in the right order.',
      'GULF NEXT coordinates these disciplines on industrial construction projects, focusing on planning, interfaces and quality from mobilisation to handover.',
    ],
    focus: [
      { title: 'Industrial plants', desc: 'Construction of process and manufacturing facilities.' },
      { title: 'Utilities and power', desc: 'Balance-of-plant and utility system construction.' },
      { title: 'Storage facilities', desc: 'Tank areas, bunds and associated piping.' },
      { title: 'Supporting infrastructure', desc: 'Pipe racks, shelters, buildings and site works.' },
    ],
    capabilities: [
      'Integrated multi-discipline construction',
      'Structural steel fabrication and erection',
      'Construction planning and sequencing',
      'Electromechanical installation',
      'Quality control and inspection plans',
      'Handover documentation',
    ],
    faqs: [
      { q: 'Do you deliver projects outside oil and gas?', a: 'Yes. Our construction capabilities apply to industrial plants, utilities and energy infrastructure.' },
      { q: 'Can you coordinate several trades?', a: 'Yes. Multi-discipline coordination is central to how we deliver construction projects.' },
      { q: 'Do you fabricate structural steel?', a: 'Yes. Steel structure fabrication and erection is one of our services.' },
    ],
  }),
  industry(4, {
    slug: 'mechanical-equipment',
    photo: { card: 'compressor-gearbox-assembly', inner: 'pump-skid-installation' },
    gallery: [
      ['electric-motor-pump-hall', 'Electric motor and pump in a process hall'],
      ['industrial-pump-room', 'Pump room with motor and pipework'],
      ['electrical-control-panel', 'Open industrial electrical control panel'],
      ['welder-fabrication', 'Welder at work in a fabrication shop'],
    ],
    imageKey: 'scene-05',
    icon: Cog,
    title: 'Mechanical Engineering & Equipment',
    short: 'Rotating and static equipment, installation and maintenance.',
    description:
      'Installation, alignment, maintenance and supply of mechanical equipment for energy and industrial facilities.',
    context: ['Rotating equipment', 'Static equipment', 'Equipment supply and spares'],
    overview: [
      'Pumps, compressors, vessels and exchangers keep industrial facilities productive. Installing and maintaining them correctly protects reliability for years.',
      'GULF NEXT supports equipment owners with installation, alignment, overhaul and supply of mechanical equipment and spares.',
    ],
    focus: [
      { title: 'Rotating equipment', desc: 'Installation, alignment and maintenance of pumps and compressors.' },
      { title: 'Static equipment', desc: 'Installation and overhaul of vessels, exchangers and columns.' },
      { title: 'Electromechanical systems', desc: 'Motors, drives and associated systems.' },
      { title: 'Equipment supply', desc: 'Sourcing of equipment, spares and materials.' },
    ],
    capabilities: [
      'Equipment installation and alignment',
      'Overhaul and corrective maintenance',
      'Shop and site fabrication',
      'Lift planning and rigging',
      'Spares and material supply',
      'Testing and documentation',
    ],
    faqs: [
      { q: 'Do you install and maintain rotating equipment?', a: 'Yes. Installation, alignment and maintenance of rotating equipment are core capabilities.' },
      { q: 'Can you supply spares?', a: 'Yes. We source equipment, spares and consumables to specification.' },
      { q: 'Do you work outside oil and gas?', a: 'Yes. Mechanical equipment services apply across energy and industrial facilities.' },
    ],
  }),
]

export function findIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug)
}
