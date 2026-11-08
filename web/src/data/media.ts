/**
 * GULF NEXT — media asset catalogue
 * ----------------------------------------------------------------------------
 * Single source of truth connecting every cinematic scene to its website
 * section. The old `media-map.js` is kept at the project root for reference
 * only; this TypeScript port is what the React app imports.
 *
 * Every `original` filename below was verified on disk (project root) during
 * the 2026-11-08 audit. Spellings are exact — several are irregular.
 *
 * Web versions are produced by `../tools/build-media.sh` at the project root
 * (H.264, fast-start) and served from `/assets/videos/{1080,720}/<id>.mp4`.
 */
import type { MediaAsset, MediaSection, ResolvedMedia, SectionKey } from '@/types/media'

const VIDEOS = '/assets/videos'
const POSTERS = '/assets/posters'

function asset(
  id: string,
  meta: Omit<MediaAsset, 'id' | 'sources' | 'poster' | 'posterSmall'>,
): MediaAsset {
  return Object.freeze({
    id,
    ...meta,
    sources: { hd: `${VIDEOS}/1080/${id}.mp4`, sd: `${VIDEOS}/720/${id}.mp4` },
    poster: `${POSTERS}/${id}.jpg`,
    posterSmall: `${POSTERS}/${id}-sm.jpg`,
  })
}

export const ASSETS: Readonly<Record<string, MediaAsset>> = Object.freeze({
  'scene-01': asset('scene-01-homepage-opening', {
    scene: '01',
    title: 'Homepage opening',
    original: 'Scene 01 — Homepage opening.mp4',
    available: true,
    sourceResolution: '1920x1080',
    duration: 8.04,
  }),
  'scene-02': asset('scene-02-oil-extraction', {
    scene: '02',
    title: 'Oil extraction',
    original: 'Scene 02 — Oil extraction.mp4',
    available: true,
    sourceResolution: '1280x720',
    duration: 8.04,
  }),
  'scene-03': asset('scene-03-offshore-extraction', {
    scene: '03',
    title: 'Offshore extraction',
    original: 'Scene 03 — Offshore extraction.mp4',
    available: true,
    sourceResolution: '1920x1080',
    duration: 8.04,
  }),
  'scene-04': asset('scene-04-onshore', {
    scene: '04',
    title: 'Onshore production',
    original: 'scene-4-oonshore.mp4',
    available: true,
    sourceResolution: '1920x1080',
    duration: 8.04,
  }),
  'scene-05': asset('scene-05-mechanical-engineering', {
    scene: '05',
    title: 'Mechanical engineering',
    original: 'Scene 05 — Mechanical engineering.mp4',
    available: true,
    sourceResolution: '1920x1080',
    duration: 8.04,
  }),
  'scene-09': asset('scene-09-about-us', {
    scene: '09',
    title: 'About Us (homepage)',
    original: 'Scene 09  About Us.mp4',
    available: true,
    sourceResolution: '1920x1080',
    duration: 7.04,
  }),
  'scene-10': asset('scene-10-about-us', {
    scene: '10',
    title: 'About Us — company identity',
    original: 'Scene 10 — About Us.mp4',
    available: true,
    sourceResolution: '1920x1080',
    duration: 8.04,
  }),
  'scene-11': asset('scene-11-services', {
    scene: '11',
    title: 'Services — industrial capabilities',
    original: 'Scene 11 — Services.mp4',
    available: true,
    sourceResolution: '1920x1080',
    duration: 8.04,
  }),
  'refinery': asset('refinery-operations', {
    scene: 'R',
    title: 'Refinery operations',
    original: 'refinery operation.mp4',
    available: true,
    sourceResolution: '1920x1080',
    duration: 17.04,
  }),
  'scene-12': asset('scene-12-industries', {
    scene: '12',
    title: 'Industries showcase',
    original: 'Scene 12 — Industries.mp4',
    available: true,
    sourceResolution: '1920x1080',
    duration: 8.04,
  }),
})

export const SECTIONS: Readonly<Record<SectionKey, MediaSection>> = Object.freeze({
  // Homepage — the six approved scenes in storyboard order.
  'home.opening':     { assetKey: 'scene-01', page: 'index',      label: 'Homepage hero' },
  'home.extraction':  { assetKey: 'scene-02', page: 'index',      label: 'Oil extraction chapter' },
  'home.offshore':    { assetKey: 'scene-03', page: 'index',      label: 'Offshore chapter' },
  'home.onshore':     { assetKey: 'scene-04', page: 'index',      label: 'Onshore chapter' },
  'home.engineering': { assetKey: 'scene-05', page: 'index',      label: 'Mechanical engineering chapter' },
  'home.about':       { assetKey: 'scene-09', page: 'index',      label: 'About teaser' },
  // Inner pages.
  'about.hero':       { assetKey: 'scene-10', page: 'about',      label: 'About Us hero' },
  'services.hero':    { assetKey: 'scene-11', page: 'services',   label: 'Services hero' },
  'industries.hero':  { assetKey: 'scene-12', page: 'industries', label: 'Industries hero' },
  'home.refinery':    { assetKey: 'refinery', page: 'index',      label: 'Refinery operations (scroll-synced)' },
})

/** Scene files found on disk that are not wired to any section. */
export const UNASSIGNED = Object.freeze([
  {
    original: 'scene about us home.mp4',
    duration: 7.04,
    sourceResolution: '1920x1080',
    note:
      'Not in the approved six-scene homepage list. Looks like an alternate ' +
      'take for the homepage About slot (Scene 09 already fills that slot).',
  },
])

/**
 * Resolve a section key to a playable asset, following `fallback` when the
 * mapped scene is not yet available. Returns `null` for an unknown key or a
 * resolution that ends on an unavailable asset.
 */
export function resolveMedia(sectionKey: SectionKey): ResolvedMedia | null {
  const section = SECTIONS[sectionKey]
  if (!section) return null
  const seen = new Set<string>()
  let currentKey: string | undefined = section.assetKey
  let asset: MediaAsset | undefined = ASSETS[currentKey]
  while (asset && !asset.available && asset.fallback && !seen.has(asset.fallback)) {
    seen.add(asset.fallback)
    currentKey = asset.fallback
    asset = ASSETS[currentKey]
  }
  if (!asset || !asset.available) return null
  return { section, asset, isFallback: section.assetKey !== currentKey }
}

/** Poster URLs for a catalogue key, following fallbacks. */
export function posterFor(assetKey: string): { poster: string; posterSmall: string } {
  let a: MediaAsset | undefined = ASSETS[assetKey]
  const seen = new Set<string>()
  while (a && !a.available && a.fallback && !seen.has(a.fallback)) {
    seen.add(a.fallback)
    a = ASSETS[a.fallback]
  }
  const fallback = ASSETS['scene-01']!
  return { poster: (a ?? fallback).poster, posterSmall: (a ?? fallback).posterSmall }
}

/** The playable asset for a catalogue key, following fallbacks. */
export function assetFor(assetKey: string): MediaAsset {
  let a: MediaAsset | undefined = ASSETS[assetKey]
  const seen = new Set<string>()
  while (a && !a.available && a.fallback && !seen.has(a.fallback)) {
    seen.add(a.fallback)
    a = ASSETS[a.fallback]
  }
  return a && a.available ? a : ASSETS['scene-01']!
}
