import { useSyncExternalStore } from 'react'
import { getNetworkTier, type NetworkTier } from '@/lib/network'

const noop = () => () => undefined

/**
 * The visitor's network tier, safe for pre-rendered pages: hydration uses the
 * build-time value ('fast', the full experience the HTML was rendered with),
 * then React re-renders with the real tier (e.g. poster-only on Save-Data).
 */
export function useNetworkTier(): NetworkTier {
  return useSyncExternalStore(noop, getNetworkTier, () => 'fast')
}
