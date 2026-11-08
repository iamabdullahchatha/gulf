/**
 * Browser network and device helpers used by the video components to decide
 * whether to play a background clip, poster it, or defer to the user.
 */

interface MinimalNetworkInformation {
  saveData?: boolean
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
}

interface NavigatorWithConnection extends Navigator {
  connection?: MinimalNetworkInformation
}

/**
 * - `none`  — Save-Data or 2G; show a poster and do not download video.
 * - `slow`  — 3G; serve the 720p source.
 * - `fast`  — 4G, wired, or unreported; serve the 1080p source.
 */
export type NetworkTier = 'none' | 'slow' | 'fast'

export function getNetworkTier(): NetworkTier {
  if (typeof navigator === 'undefined') return 'fast'
  const c = (navigator as NavigatorWithConnection).connection
  if (!c) return 'fast'
  if (c.saveData) return 'none'
  if (c.effectiveType === 'slow-2g' || c.effectiveType === '2g') return 'none'
  if (c.effectiveType === '3g') return 'slow'
  return 'fast'
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
