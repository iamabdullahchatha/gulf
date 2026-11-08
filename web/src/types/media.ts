/**
 * Media types. The runtime data lives in `src/data/media.ts`; these types are
 * the contract that both the data file and the consumers (CinematicHero,
 * VideoBackground, ScrollScene) agree on.
 */
export interface MediaSources {
  /** H.264 1920x1080, fast-start, ~10 MB — served to desktops. */
  hd: string
  /** H.264 1280x720, fast-start, ~6 MB — served to mobile and slow networks. */
  sd: string
  /**
   * H.264 640x360, ~0.9 MB. Loads first so scroll-scrubbed footage moves within
   * a moment of arriving on the page; the full-quality clip crossfades in once
   * it has downloaded.
   */
  preview: string
}

export interface MediaAsset {
  /** Kebab-case identifier used as the filename stem. */
  id: string
  /** Scene number as it appears in the production storyboard ("01" … "12"). */
  scene: string
  /** Short human title, used for the fallback alt text. */
  title: string
  /** The author-facing original filename on disk (for audit traceability). */
  original: string | null
  /** False when the underlying renders are not yet in the project. */
  available: boolean
  sources: MediaSources
  /** 1920-wide poster, used as the loading placeholder and final fallback. */
  poster: string
  /** 960-wide poster, used at ≤768 px. */
  posterSmall: string
  /** Optional sibling to use while `available` is false. */
  fallback?: string
  /** Original source resolution ("1920x1080"). */
  sourceResolution?: string
  /** Original clip duration in seconds. */
  duration?: number
}

/** Every website section that mounts a cinematic hero. */
export type SectionKey =
  | 'home.opening'
  | 'home.extraction'
  | 'home.offshore'
  | 'home.onshore'
  | 'home.engineering'
  | 'home.about'
  | 'about.hero'
  | 'services.hero'
  | 'industries.hero'
  | 'home.refinery'

export interface MediaSection {
  assetKey: string
  page: 'index' | 'about' | 'services' | 'industries'
  label: string
}

export interface ResolvedMedia {
  section: MediaSection
  asset: MediaAsset
  /** True when `section.assetKey` was unavailable and a fallback is being used. */
  isFallback: boolean
}
