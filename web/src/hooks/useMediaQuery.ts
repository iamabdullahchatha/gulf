import { useCallback, useSyncExternalStore } from 'react'

/**
 * Reactive `matchMedia`, safe for pre-rendered pages.
 *
 * Pages are rendered to HTML at build time, where there is no screen, so the
 * server value is `false` (the phone-first layout). During hydration React
 * uses that same value, so the markup always matches, and then re-renders
 * with the real answer straight away. Afterwards it tracks changes. Prefer CSS
 * breakpoints for anything above the fold; use this for JS-driven behaviour.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
