/**
 * The homepage film: the six approved scenes played as one continuous,
 * scroll-driven sequence. Order is fixed by the brief:
 *   01 opening · 02 oil extraction · 03 offshore · 04 onshore ·
 *   05 mechanical engineering · 09 final chapter.
 *
 * Every beat is pinned to the seconds of footage it describes (timings come
 * from frame-by-frame review of each clip), so the words always match what
 * is on screen. Copy states capabilities only — no unverified figures.
 */
import type { SectionKey } from '@/types/media'

export interface FilmBeat {
  /** Start and end, in seconds of this scene's clip. */
  from: number
  to: number
  title: string
  /** Phrase inside `title` set in the editorial serif accent. */
  accent?: string
  body: string
  /** Overrides the scene alignment for this beat. */
  align?: 'left' | 'right' | 'center'
}

export interface FilmScene {
  /** Anchor id — used by the chapter rail and deep links. */
  id: string
  index: string
  section: SectionKey
  label: string
  align: 'left' | 'right' | 'center'
  beats: FilmBeat[]
  cta?: { label: string; href: string }
}

export const FILM_SCENES: FilmScene[] = [
  {
    // 0–3 s wide night aerial of the refinery · 3–8 s camera flies in between the columns
    id: 'opening',
    index: '01',
    section: 'home.opening',
    label: 'The facility',
    align: 'center',
    beats: [
      { from: 0, to: 3.1, title: 'ENGINEERING THE ENERGY FUTURE.', body: 'Integrated Oil & Gas Contracting, Industrial Engineering and Infrastructure Solutions.' },
      { from: 3.1, to: 8.1, title: 'Into the heart of the plant.', accent: 'heart', body: 'Distillation columns, process units and pipe networks — the infrastructure we engineer, build and maintain.' },
    ],
    cta: { label: 'Explore our capabilities', href: '/services' },
  },
  {
    // 0–2.2 rig in the desert · 2.2–5.4 down the casing to the reservoir · 5.4–8 cross-section, rig to reservoir
    id: 'extraction',
    index: '02',
    section: 'home.extraction',
    label: 'Oil extraction',
    align: 'left',
    beats: [
      { from: 0, to: 2.2, title: 'It starts at the surface.', accent: 'surface', body: 'Rig-site works, well-site facilities and field crews for onshore drilling programmes.' },
      { from: 2.2, to: 5.4, title: 'Down through the rock, to the reservoir.', accent: 'reservoir', body: 'The well is drilled and cased through each formation until it reaches the oil-bearing zone.' },
      { from: 5.4, to: 8.1, title: 'Rig and reservoir, connected.', accent: 'connected', body: 'Field supervision, inspection and tool support that keep the well producing safely.' },
    ],
    cta: { label: 'Field services', href: '/services/field-services' },
  },
  {
    // 0–4.3 aerial of the platform at sea · 4.3–8 close on topsides modules and cranes
    id: 'offshore',
    index: '03',
    section: 'home.offshore',
    label: 'Offshore',
    align: 'right',
    beats: [
      { from: 0, to: 4.3, title: 'A production platform, alone at sea.', accent: 'alone at sea', body: 'Engineering, maintenance and logistics for platforms and marine assets, planned around the weather window.' },
      { from: 4.3, to: 8.1, title: 'On the topsides, every module matters.', accent: 'every module', body: 'Process modules, pipework and deck cranes — maintained and upgraded to offshore safety standards.' },
    ],
    cta: { label: 'Oil & gas industry', href: '/industries/oil-gas' },
  },
  {
    // 0–4.3 aerial of a desert processing facility and tank farm · 4.3–8 vessels behind a pipe rack
    id: 'onshore',
    index: '04',
    section: 'home.onshore',
    label: 'Onshore',
    align: 'left',
    beats: [
      { from: 0, to: 4.3, title: 'A complete onshore facility.', accent: 'complete', body: 'Gathering lines, pipe corridors, tank farms and process units delivered as one coordinated scope.' },
      { from: 4.3, to: 8.1, title: 'Vessels and pipe racks, built to run.', accent: 'built to run', body: 'Construction, commissioning and lifetime support for separation and processing equipment.' },
    ],
    cta: { label: 'Industrial plant construction', href: '/services/industrial-construction' },
  },
  {
    // 0–4.3 crane lifting a vessel section at sunset · 4.3–8 two engineers reviewing drawings on site
    id: 'engineering',
    index: '05',
    section: 'home.engineering',
    label: 'Mechanical',
    align: 'right',
    beats: [
      { from: 0, to: 4.3, title: 'Heavy lifts, placed with precision.', accent: 'precision', body: 'Lift studies, rigging and execution for vessels, columns and modules on live plants.' },
      { from: 4.3, to: 8.1, title: 'Engineers who plan every detail.', accent: 'every detail', body: 'Drawings are reviewed on site, so fabrication and installation match the design.' },
    ],
    cta: { label: 'Mechanical engineering', href: '/services/mechanical' },
  },
  {
    // 0–2.2 refinery lit at dusk · 2.2–5.6 crew at the pipework, engineer with tablet · 5.6–8 team overlooking the plant
    id: 'about',
    index: '06',
    section: 'home.about',
    label: 'GULF NEXT',
    align: 'center',
    beats: [
      { from: 0, to: 2.2, title: 'Operating day and night.', accent: 'day and night', body: 'Plants never stop — and neither does the support behind them.' },
      { from: 2.2, to: 5.6, title: 'People who know the plant.', accent: 'know the plant', body: 'Field engineers and technicians who understand process plant from the inside.' },
      { from: 5.6, to: 8.1, title: 'A regional partner built on engineering discipline.', accent: 'engineering discipline', body: 'Specialist people, proven methods and local knowledge — helping operators build and run assets with confidence.' },
    ],
    cta: { label: 'Discover our story', href: '/about' },
  },
]


/**
 * Refinery operations — synced to "refinery operation.mp4" (17 s).
 * Views (frame review): 0–4.2 s over the storage tanks toward the columns ·
 * 4.2–8.6 s between the distillation columns · 8.6–11.9 s close on a pump
 * and flanged pipework · 11.9–17 s wide sunset panorama of the refinery.
 */
export interface RefineryBeat extends FilmBeat {
  step: string
}

/**
 * Refinery film beats, pinned to the cuts in the footage (measured frame by frame):
 *   0–4.1 flyover of the tank farm with columns behind ·
 *   4.1–8.2 low pass between distillation columns and platforms ·
 *   8.2–12.3 close view of a pump with flanged pipework and valves ·
 *   12.3–17 the whole refinery at sunset.
 */
export const REFINERY_BEATS: RefineryBeat[] = [
  { from: 0, to: 4.1, step: 'Crude intake', title: 'It begins at the tank farm.', accent: 'tank farm', body: 'Crude arrives, is stored and is transferred to the process units: storage tanks, transfer lines and metering that we build and maintain.' },
  { from: 4.1, to: 8.2, step: 'Distillation', title: 'Columns that separate crude by fraction.', accent: 'by fraction', body: 'Towering columns, platforms and internals, installed, revamped and inspected so separation runs efficiently.' },
  { from: 8.2, to: 12.3, step: 'Rotating equipment', title: 'Pumps and pipework that keep product moving.', accent: 'keep product moving', body: 'Pump and compressor installation, alignment and flanged piping, executed to tight tolerances on live plant.' },
  { from: 12.3, to: 17.1, step: 'Integrated operations', title: 'One refinery, running as one system.', accent: 'one system', body: 'Upgrades, revamps and turnarounds delivered by crews who understand the hazards, and the schedule.' },
]
