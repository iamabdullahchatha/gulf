/**
 * Services catalogue: the nine service lines surfaced by the Services index,
 * the homepage grid, the mega menu and the detail routes under /services/:slug.
 * Photos follow the convention /assets/images/services/{slug}[-inner][-sm].jpg.
 */
import { Anchor, Cog, Construction, Drill, Factory, GitBranch, Truck, Wrench, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FaqItem } from '@/data/faq'

export interface ScopeItem {
  title: string
  desc: string
}

export interface Service {
  slug: string
  /** Media-catalogue key whose scene video plays in this service's hero. */
  imageKey: string
  /** Homepage card photograph and its small variant. */
  image: string
  imageSmall: string
  /** Inner-page photograph: catalogue rows, detail page, menu preview. */
  innerImage: string
  innerImageSmall: string
  /** Licensed stock photograph for the equipment panel (see media/stock-photos.json). */
  detailImage: string
  detailImageSmall: string
  index: string
  icon: LucideIcon
  title: string
  short: string
  description: string
  /** Short scope labels for cards and the mega menu (derived from `scope`). */
  highlights: string[]
  intro: string[]
  scope: ScopeItem[]
  capabilities: string[]
  equipment: string[]
  approach: ScopeItem[]
  /** Industry slugs this service supports. */
  industries: string[]
  /** Service slugs commonly delivered alongside this one. */
  related: string[]
  faqs: FaqItem[]
}

type ServiceInput = Omit<Service, 'image' | 'imageSmall' | 'innerImage' | 'innerImageSmall' | 'detailImage' | 'detailImageSmall' | 'highlights' | 'index'> & { stock: string }

const DIR = '/assets/images/services'
const STOCK = '/assets/images/stock'

function service(n: number, { stock, ...s }: ServiceInput): Service {
  return {
    ...s,
    detailImage: `${STOCK}/${stock}.jpg`,
    detailImageSmall: `${STOCK}/${stock}-sm.jpg`,
    index: String(n).padStart(2, '0'),
    image: `${DIR}/${s.slug}.jpg`,
    imageSmall: `${DIR}/${s.slug}-sm.jpg`,
    innerImage: `${DIR}/${s.slug}-inner.jpg`,
    innerImageSmall: `${DIR}/${s.slug}-inner-sm.jpg`,
    highlights: s.scope.slice(0, 4).map((x) => x.title),
  }
}

export const SERVICES: Service[] = [
  service(1, {
    slug: 'field-services',
    stock: 'offshore-platform-silhouette',
    imageKey: 'scene-03',
    icon: Anchor,
    title: 'Onshore & Offshore Field Services',
    short: 'Operational support for oil and gas fields on land and at sea.',
    description:
      'Skilled crews, site services and technical support that keep onshore fields and offshore facilities running safely and productively.',
    intro: [
      'Oil and gas fields depend on a steady flow of skilled people, equipment and site services. GULF NEXT provides field support for onshore production sites and offshore facilities, working within the operator’s procedures and permit systems.',
      'Our teams are organised to mobilise quickly, integrate with existing site organisations and hand back areas in a clean, documented condition at the end of each scope.',
    ],
    scope: [
      { title: 'Field operations support', desc: 'Manpower and technical crews to support production, utilities and site operations.' },
      { title: 'Offshore facility support', desc: 'Mechanical and maintenance crews for fixed platforms and offshore installations.' },
      { title: 'Site services and logistics', desc: 'Material handling, site mobilisation and logistics coordination for remote locations.' },
      { title: 'Minor modifications', desc: 'Small brownfield modifications and tie-ins executed under live-plant controls.' },
      { title: 'Inspection support', desc: 'Access, preparation and reinstatement support for inspection campaigns.' },
      { title: 'Commissioning assistance', desc: 'Crews to support pre-commissioning, testing and start-up activities.' },
    ],
    capabilities: [
      'Multi-discipline crews for onshore and offshore locations',
      'Work under operator permit-to-work systems',
      'Brownfield execution on live facilities',
      'Remote-site mobilisation and accommodation planning',
      'Daily progress and safety reporting',
      'Clean, documented area handback',
    ],
    equipment: [
      'Hand and power tools for mechanical work',
      'Lifting and rigging gear',
      'Mobile workshops and tool containers',
      'Portable welding and cutting sets',
      'Personal and collective safety equipment',
      'Site transport and material handling equipment',
    ],
    approach: [
      { title: 'Understand the site', desc: 'We review the operating context, site rules and constraints with your team.' },
      { title: 'Plan the mobilisation', desc: 'Crews, equipment and logistics are sequenced around the operating window.' },
      { title: 'Execute under control', desc: 'Work proceeds under permit, with supervision and daily reporting.' },
      { title: 'Hand back cleanly', desc: 'Areas are reinstated and records closed out before demobilisation.' },
    ],
    industries: ['oil-gas', 'petrochemical'],
    related: ['wellsite-drilling', 'maintenance', 'pipelines'],
    faqs: [
      { q: 'Do you support both onshore and offshore locations?', a: 'Yes. Our field services are structured for onshore production sites and offshore installations, with crews organised around the logistics of each environment.' },
      { q: 'Can your crews work within our permit-to-work system?', a: 'Yes. Our teams are briefed on and work under the operator’s permit-to-work and site safety procedures.' },
      { q: 'Can you provide crews for short-notice scopes?', a: 'Share the scope and timing with us. We will confirm availability and a realistic mobilisation plan.' },
    ],
  }),
  service(2, {
    slug: 'wellsite-drilling',
    stock: 'land-drilling-rig',
    imageKey: 'scene-02',
    icon: Drill,
    title: 'Drilling & Wellsite Support',
    short: 'Wellsite construction, rig-site services and drilling support.',
    description:
      'Wellsite preparation, rig-site mechanical support and wellhead area works that help drilling and workover programmes stay on schedule.',
    intro: [
      'Drilling programmes run to tight sequences, and delays at the wellsite ripple through the whole campaign. GULF NEXT supports drilling contractors and operators with site preparation, rig-site mechanical services and wellhead area works.',
      'We plan each scope around the rig schedule so equipment and crews are ready when the programme needs them.',
    ],
    scope: [
      { title: 'Wellsite preparation', desc: 'Site preparation and civil support ahead of rig moves.' },
      { title: 'Rig-site mechanical services', desc: 'Mechanical support, fabrication and repairs at the rig site.' },
      { title: 'Wellhead area works', desc: 'Piping and hook-up works around wellheads and flowlines.' },
      { title: 'Rig move support', desc: 'Crews and equipment to support rig moves and rig-up activities.' },
      { title: 'Workover support', desc: 'Site services and mechanical support for workover operations.' },
      { title: 'Camp and site facilities', desc: 'Support for temporary site facilities and utilities.' },
    ],
    capabilities: [
      'Scopes planned around the rig schedule',
      'Flowline and wellhead hook-up',
      'On-site fabrication and repair',
      'Coordination with drilling contractors',
      'Desert and remote location experience',
      'Safety-led rig-site supervision',
    ],
    equipment: [
      'Mobile welding and fabrication units',
      'Lifting and rigging equipment',
      'Pipe handling tools',
      'Pressure testing equipment',
      'Generators and site utilities',
      'Material transport vehicles',
    ],
    approach: [
      { title: 'Align with the programme', desc: 'We map our scope against the drilling sequence and rig moves.' },
      { title: 'Prepare in advance', desc: 'Materials, crews and equipment are staged before they are needed.' },
      { title: 'Execute at the rig site', desc: 'Work proceeds under the rig and operator safety systems.' },
      { title: 'Close out and move', desc: 'Sites are handed over and crews move with the programme.' },
    ],
    industries: ['oil-gas', 'mechanical-equipment'],
    related: ['field-services', 'pipelines', 'equipment-supply'],
    faqs: [
      { q: 'Do you work directly for drilling contractors?', a: 'We can support operators or drilling contractors, depending on how the programme is structured.' },
      { q: 'Can you handle flowline and wellhead hook-up?', a: 'Yes. Wellhead area piping and flowline hook-up are part of this service.' },
      { q: 'How do you keep pace with rig moves?', a: 'We plan crews and equipment against the rig schedule so our scope is ready ahead of each move.' },
    ],
  }),
  service(3, {
    slug: 'pipelines',
    stock: 'twin-pipeline-corridor',
    imageKey: 'scene-10',
    icon: GitBranch,
    title: 'Oil & Gas Pipeline Works',
    short: 'Pipeline construction, tie-ins, testing and repair.',
    description:
      'Construction, tie-in and repair of oil and gas pipelines and flowlines, from material receipt through testing and handover.',
    intro: [
      'Pipelines carry the value of every upstream and processing asset. GULF NEXT delivers pipeline and flowline construction, tie-ins and repair works with disciplined welding, inspection and testing.',
      'Each scope is planned around route conditions, live-system interfaces and the operator’s integrity requirements.',
    ],
    scope: [
      { title: 'Pipeline construction', desc: 'Stringing, welding, lowering and reinstatement for onshore lines.' },
      { title: 'Flowlines and gathering lines', desc: 'Flowline construction connecting wells to gathering facilities.' },
      { title: 'Tie-ins and hot-taps support', desc: 'Planned tie-ins to existing systems under live-plant controls.' },
      { title: 'Hydrostatic testing', desc: 'Testing, dewatering and drying in line with the test procedure.' },
      { title: 'Pipeline repairs', desc: 'Section replacements, clamps and repair works.' },
      { title: 'Station piping', desc: 'Piping at pump stations, manifolds and launcher and receiver areas.' },
    ],
    capabilities: [
      'Qualified welding procedures and welders as specified',
      'Coordination with inspection and NDT providers',
      'Live-system tie-in planning',
      'Test packs and documentation',
      'Route access and reinstatement planning',
      'Integration with civil and mechanical scopes',
    ],
    equipment: [
      'Pipe handling and lifting equipment',
      'Welding machines and bevelling tools',
      'Hydrotest pumps and recorders',
      'Coating and wrapping tools',
      'Generators and compressors',
      'Pipe transport vehicles',
    ],
    approach: [
      { title: 'Survey and plan', desc: 'Route conditions, interfaces and test requirements are reviewed first.' },
      { title: 'Prepare materials', desc: 'Pipe, fittings and consumables are received, checked and staged.' },
      { title: 'Build and inspect', desc: 'Welding and installation proceed with inspection hold points.' },
      { title: 'Test and hand over', desc: 'Lines are tested, documented and handed over to operations.' },
    ],
    industries: ['oil-gas', 'petrochemical', 'construction'],
    related: ['mechanical', 'industrial-construction', 'field-services'],
    faqs: [
      { q: 'Do you handle tie-ins to live systems?', a: 'Yes. Tie-ins are planned with the operator and executed under live-plant controls and permits.' },
      { q: 'Who performs non-destructive testing?', a: 'We coordinate with the inspection and NDT providers specified for the project.' },
      { q: 'Do you provide test documentation?', a: 'Yes. Test packs and records are compiled for handover.' },
    ],
  }),
  service(4, {
    slug: 'mechanical',
    stock: 'turbine-compressor-cutaway',
    imageKey: 'scene-05',
    icon: Wrench,
    title: 'Mechanical Engineering Works',
    short: 'Piping, equipment installation, fabrication and alignment.',
    description:
      'Precision mechanical works on greenfield and live assets, from process piping and equipment installation to fabrication and alignment.',
    intro: [
      'Mechanical works sit at the centre of every oil, gas and processing facility. GULF NEXT delivers piping, equipment installation and fabrication scopes with careful attention to tolerances, cleanliness and documentation.',
      'We work on new construction and on operating plants, where planning and isolation discipline matter as much as craftsmanship.',
    ],
    scope: [
      { title: 'Process piping', desc: 'Fabrication and installation of process and utility piping.' },
      { title: 'Rotating equipment installation', desc: 'Setting, alignment and installation of pumps, compressors and drivers.' },
      { title: 'Static equipment', desc: 'Installation of vessels, exchangers, columns and tanks.' },
      { title: 'Shop and site fabrication', desc: 'Fabrication of spools, supports and mechanical components.' },
      { title: 'Heavy lifting coordination', desc: 'Lift planning and rigging for equipment installation.' },
      { title: 'Testing and pre-commissioning', desc: 'Pressure testing, flushing and mechanical completion.' },
    ],
    capabilities: [
      'Greenfield and brownfield mechanical execution',
      'Alignment of rotating equipment',
      'Piping fabrication to project specifications',
      'Lift planning and rigging supervision',
      'Mechanical completion documentation',
      'Coordination with civil, steel and E&I trades',
    ],
    equipment: [
      'Welding and cutting equipment',
      'Pipe bevelling and threading machines',
      'Alignment tools',
      'Cranes and lifting gear as required',
      'Pressure testing equipment',
      'Torque and tensioning tools',
    ],
    approach: [
      { title: 'Review engineering', desc: 'Drawings, specifications and interfaces are checked before work starts.' },
      { title: 'Fabricate and prepare', desc: 'Spools and components are fabricated and inspected.' },
      { title: 'Install and align', desc: 'Equipment and piping are installed with quality hold points.' },
      { title: 'Test and complete', desc: 'Systems are tested and mechanical completion is documented.' },
    ],
    industries: ['mechanical-equipment', 'petrochemical', 'oil-gas'],
    related: ['steel-structures', 'electromechanical', 'pipelines'],
    faqs: [
      { q: 'Do you work on operating plants?', a: 'Yes. We execute mechanical scopes on live facilities under the operator’s isolation and permit procedures.' },
      { q: 'Can you fabricate piping spools?', a: 'Yes. Spool fabrication can be carried out in the shop or on site, depending on the scope.' },
      { q: 'Do you install rotating equipment?', a: 'Yes. Installation and alignment of pumps, compressors and drivers is part of this service.' },
    ],
  }),
  service(5, {
    slug: 'industrial-construction',
    stock: 'tower-crane',
    imageKey: 'scene-04',
    icon: Factory,
    title: 'Industrial Plant Construction',
    short: 'Construction of processing plants, facilities and storage.',
    description:
      'Multi-discipline construction of processing plants, gathering facilities and storage areas, coordinated under one point of accountability.',
    intro: [
      'Industrial plants bring many disciplines together in a tight footprint. GULF NEXT coordinates civil, steel, mechanical and electromechanical works so construction progresses in the right sequence.',
      'We focus on planning, interface control and quality so facilities are ready for commissioning with fewer late surprises.',
    ],
    scope: [
      { title: 'Processing facilities', desc: 'Construction of process units, gathering stations and utilities.' },
      { title: 'Storage and tank areas', desc: 'Tank erection support, bunds and associated piping.' },
      { title: 'Civil and foundations support', desc: 'Foundations, plinths and civil works for equipment and structures.' },
      { title: 'Plant buildings', desc: 'Support for control rooms, substations and technical buildings.' },
      { title: 'Multi-discipline coordination', desc: 'Sequencing of civil, mechanical, steel and E&I trades.' },
      { title: 'Mechanical completion', desc: 'Punch lists, records and readiness for commissioning.' },
    ],
    capabilities: [
      'Integrated multi-discipline construction',
      'Construction planning and sequencing',
      'Interface and subcontract coordination',
      'Quality control and inspection plans',
      'Brownfield expansion work',
      'Handover documentation',
    ],
    equipment: [
      'Cranes and lifting equipment as required',
      'Earthmoving and compaction equipment',
      'Concrete placement tools',
      'Welding and fabrication equipment',
      'Scaffolding and access systems',
      'Site offices and stores',
    ],
    approach: [
      { title: 'Plan the build', desc: 'Sequence, interfaces and resources are defined before mobilisation.' },
      { title: 'Mobilise the site', desc: 'Site facilities, stores and access are established.' },
      { title: 'Construct by discipline', desc: 'Trades progress in sequence with quality hold points.' },
      { title: 'Complete and hand over', desc: 'Punch lists are closed and systems are handed over.' },
    ],
    industries: ['construction', 'petrochemical', 'oil-gas'],
    related: ['steel-structures', 'mechanical', 'electromechanical'],
    faqs: [
      { q: 'Can you manage several disciplines on one site?', a: 'Yes. Multi-discipline coordination is the core of this service.' },
      { q: 'Do you work on plant expansions?', a: 'Yes. We support brownfield expansions alongside operating units.' },
      { q: 'What do you hand over at completion?', a: 'Completed punch lists, inspection records and the documentation specified for the project.' },
    ],
  }),
  service(6, {
    slug: 'steel-structures',
    stock: 'steel-lattice-structure',
    imageKey: 'scene-01',
    icon: Construction,
    title: 'Steel Structure Fabrication & Erection',
    short: 'Pipe racks, platforms, shelters and structural steelwork.',
    description:
      'Fabrication and erection of structural steel for industrial facilities, including pipe racks, platforms, shelters and equipment supports.',
    intro: [
      'Structural steel frames the layout of every industrial facility. GULF NEXT fabricates and erects steelwork that is accurate, well documented and ready for the trades that follow.',
      'We plan erection sequences carefully so lifts are safe and other disciplines can progress without delay.',
    ],
    scope: [
      { title: 'Pipe racks', desc: 'Fabrication and erection of pipe racks and sleepers.' },
      { title: 'Platforms and walkways', desc: 'Access platforms, stairs, ladders and handrails.' },
      { title: 'Equipment supports', desc: 'Supports and frames for vessels, exchangers and skids.' },
      { title: 'Industrial shelters', desc: 'Steel shelters and sheds for equipment and storage.' },
      { title: 'Structural modifications', desc: 'Strengthening and modification of existing structures.' },
      { title: 'Bolting and erection', desc: 'Bolting, levelling and alignment to drawings.' },
    ],
    capabilities: [
      'Fabrication to approved shop drawings',
      'Erection planning and lift sequencing',
      'Dimensional control and surveys',
      'Surface preparation coordination',
      'Brownfield structural modifications',
      'Material traceability records',
    ],
    equipment: [
      'Cutting, drilling and welding equipment',
      'Cranes and lifting gear as required',
      'Bolt tensioning tools',
      'Survey and levelling instruments',
      'Scaffolding and access equipment',
      'Steel transport vehicles',
    ],
    approach: [
      { title: 'Check drawings', desc: 'Shop drawings and connection details are reviewed and approved.' },
      { title: 'Fabricate', desc: 'Members are cut, fabricated and marked for erection.' },
      { title: 'Erect in sequence', desc: 'Steel is lifted and bolted following the erection plan.' },
      { title: 'Verify and release', desc: 'Alignment is checked and areas are released to other trades.' },
    ],
    industries: ['construction', 'oil-gas', 'petrochemical'],
    related: ['industrial-construction', 'mechanical', 'pipelines'],
    faqs: [
      { q: 'Do you fabricate and erect, or erect only?', a: 'We can do both, or erect steel supplied by others, depending on the scope.' },
      { q: 'Can you modify existing structures?', a: 'Yes. Structural modifications on operating facilities are part of this service.' },
      { q: 'How is erection accuracy controlled?', a: 'Through dimensional checks and surveys at agreed points during erection.' },
    ],
  }),
  service(7, {
    slug: 'electromechanical',
    stock: 'electrical-control-room',
    imageKey: 'scene-09',
    icon: Zap,
    title: 'Electromechanical Installation & Maintenance',
    short: 'Electrical, instrumentation and electromechanical systems.',
    description:
      'Installation and maintenance of electromechanical systems, including power distribution, instrumentation and the equipment that keeps plants running.',
    intro: [
      'Modern facilities rely on electrical and instrumentation systems working in step with mechanical equipment. GULF NEXT installs and maintains electromechanical systems with careful isolation and testing practice.',
      'We coordinate closely with mechanical and civil trades so systems are installed, tested and ready together.',
    ],
    scope: [
      { title: 'Electrical installation', desc: 'Cable routing, termination and installation of electrical equipment.' },
      { title: 'Instrumentation installation', desc: 'Installation and hook-up of field instruments and tubing.' },
      { title: 'Motor and drive works', desc: 'Installation, connection and maintenance of motors and drives.' },
      { title: 'Lighting and small power', desc: 'Plant lighting, small power and earthing systems.' },
      { title: 'HVAC and utilities', desc: 'Support for HVAC and utility systems in plant buildings.' },
      { title: 'Testing and maintenance', desc: 'Pre-commissioning checks and planned maintenance.' },
    ],
    capabilities: [
      'Electrical and instrumentation installation',
      'Isolation and lock-out discipline',
      'Loop checks and pre-commissioning support',
      'Planned electromechanical maintenance',
      'Coordination with mechanical trades',
      'As-built records',
    ],
    equipment: [
      'Cable pulling equipment',
      'Termination and crimping tools',
      'Insulation and continuity testers',
      'Instrument calibration equipment',
      'Tube bending tools',
      'Access equipment',
    ],
    approach: [
      { title: 'Review systems', desc: 'Drawings, schedules and interfaces are confirmed.' },
      { title: 'Install', desc: 'Cables, equipment and instruments are installed to specification.' },
      { title: 'Test', desc: 'Systems are checked and tested before energising.' },
      { title: 'Support start-up', desc: 'Our teams support commissioning and handover.' },
    ],
    industries: ['mechanical-equipment', 'construction', 'petrochemical'],
    related: ['mechanical', 'maintenance', 'industrial-construction'],
    faqs: [
      { q: 'Do you install instrumentation as well as electrical systems?', a: 'Yes. Instrument installation and hook-up are part of this service.' },
      { q: 'Do you offer ongoing maintenance?', a: 'Yes. Planned electromechanical maintenance can be provided after installation.' },
      { q: 'How do you manage isolation on live plants?', a: 'All work follows the operator’s isolation and lock-out procedures.' },
    ],
  }),
  service(8, {
    slug: 'maintenance',
    stock: 'welder-fabrication',
    imageKey: 'refinery',
    icon: Cog,
    title: 'Facilities Maintenance & Turnarounds',
    short: 'Planned maintenance, shutdowns and turnarounds.',
    description:
      'Planned maintenance, shutdowns and turnarounds for oil, gas and processing facilities, prepared thoroughly and executed to tight windows.',
    intro: [
      'Turnarounds succeed or fail on preparation. GULF NEXT helps operators plan, resource and execute maintenance and shutdown scopes so facilities return to service safely and on time.',
      'Between turnarounds, our teams support routine and corrective maintenance that keeps equipment reliable.',
    ],
    scope: [
      { title: 'Planned maintenance', desc: 'Routine mechanical and electromechanical maintenance.' },
      { title: 'Shutdowns and turnarounds', desc: 'Resourcing and execution of turnaround work packs.' },
      { title: 'Corrective maintenance', desc: 'Response to equipment issues and breakdowns.' },
      { title: 'Equipment overhaul', desc: 'Overhaul of valves, pumps, exchangers and vessels.' },
      { title: 'Inspection support', desc: 'Opening, cleaning and boxing up for inspection.' },
      { title: 'Turnaround planning support', desc: 'Work pack preparation and resource planning.' },
    ],
    capabilities: [
      'Turnaround resourcing and supervision',
      'Work pack preparation support',
      'Live-plant maintenance under permit',
      'Valve and equipment overhaul',
      'Shift-based execution',
      'Close-out records',
    ],
    equipment: [
      'Valve maintenance tools',
      'Bolt torquing and tensioning tools',
      'Lifting and rigging equipment',
      'Exchanger handling tools as required',
      'Cleaning equipment',
      'Mobile workshops',
    ],
    approach: [
      { title: 'Prepare work packs', desc: 'Scope, sequence and materials are defined well ahead.' },
      { title: 'Mobilise resources', desc: 'Crews, tools and equipment are ready before shutdown.' },
      { title: 'Execute safely', desc: 'Work proceeds under permit with progress tracking.' },
      { title: 'Return to service', desc: 'Equipment is boxed up, records closed and handed back.' },
    ],
    industries: ['petrochemical', 'oil-gas', 'mechanical-equipment'],
    related: ['mechanical', 'electromechanical', 'field-services'],
    faqs: [
      { q: 'Can you support a full turnaround?', a: 'Yes. We can resource and execute turnaround work packs alongside your team.' },
      { q: 'Do you provide routine maintenance outside turnarounds?', a: 'Yes. Planned and corrective maintenance are part of this service.' },
      { q: 'How early should we involve you in turnaround planning?', a: 'As early as possible. Early involvement helps with resourcing and material readiness.' },
    ],
  }),
  service(9, {
    slug: 'equipment-supply',
    stock: 'excavator-heavy-equipment',
    imageKey: 'scene-11',
    icon: Truck,
    title: 'Oilfield Equipment & Material Supply',
    short: 'Sourcing and supply of equipment, materials and spares.',
    description:
      'Sourcing, expediting and delivery of oilfield equipment, materials and spares, coordinated with your project and maintenance schedules.',
    intro: [
      'Late materials stop work. GULF NEXT sources and supplies equipment, materials and spares for oil, gas and industrial projects, coordinated with site schedules.',
      'We focus on specification checks, expediting and clear documentation so the right items arrive when they are needed.',
    ],
    scope: [
      { title: 'Equipment sourcing', desc: 'Sourcing of mechanical and process equipment to specification.' },
      { title: 'Piping materials', desc: 'Pipe, fittings, flanges, valves and gaskets.' },
      { title: 'Spares and consumables', desc: 'Maintenance spares and site consumables.' },
      { title: 'Expediting', desc: 'Follow-up with suppliers to protect delivery dates.' },
      { title: 'Logistics coordination', desc: 'Transport and delivery to site or warehouse.' },
      { title: 'Documentation', desc: 'Certificates and supply records as specified.' },
    ],
    capabilities: [
      'Specification review before ordering',
      'Supplier coordination and expediting',
      'Delivery planning aligned to site schedules',
      'Material documentation control',
      'Support for maintenance and turnaround spares',
      'Integration with our construction scopes',
    ],
    equipment: [
      'Warehouse and storage arrangements',
      'Material handling equipment',
      'Transport and delivery vehicles',
      'Inventory and tracking records',
      'Packaging and preservation materials',
      'Receiving inspection tools',
    ],
    approach: [
      { title: 'Confirm requirements', desc: 'Specifications, quantities and dates are agreed.' },
      { title: 'Source and order', desc: 'Suitable suppliers are selected and orders placed.' },
      { title: 'Expedite', desc: 'Progress is tracked to protect delivery dates.' },
      { title: 'Deliver and document', desc: 'Items arrive with the required documentation.' },
    ],
    industries: ['oil-gas', 'mechanical-equipment', 'construction'],
    related: ['maintenance', 'mechanical', 'wellsite-drilling'],
    faqs: [
      { q: 'Can you supply materials for projects you are not executing?', a: 'Yes. Supply can be provided as a standalone service.' },
      { q: 'Do you provide material certificates?', a: 'Yes. Documentation is supplied as specified in the order.' },
      { q: 'Can you support turnaround spares?', a: 'Yes. We can plan and supply spares and consumables for shutdowns.' },
    ],
  }),
]

export function findService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug)
}

/** How the nine service lines are grouped in the menu and on the Services page. */
export const SERVICE_GROUPS: { heading: string; note: string; slugs: string[] }[] = [
  { heading: 'Field & upstream', note: 'Supporting production at the wellsite, in the field and along the line.', slugs: ['field-services', 'wellsite-drilling', 'pipelines'] },
  { heading: 'Engineering & construction', note: 'Building the mechanical, structural and plant scope of new and expanding facilities.', slugs: ['mechanical', 'industrial-construction', 'steel-structures'] },
  { heading: 'Systems & support', note: 'Keeping systems powered, maintained and supplied through the asset lifecycle.', slugs: ['electromechanical', 'maintenance', 'equipment-supply'] },
]

export function servicesIn(slugs: string[]): Service[] {
  return slugs.map((s) => SERVICES.find((x) => x.slug === s)).filter((x): x is Service => Boolean(x))
}

export function servicesForIndustry(industrySlug: string): Service[] {
  return SERVICES.filter((s) => s.industries.includes(industrySlug))
}
