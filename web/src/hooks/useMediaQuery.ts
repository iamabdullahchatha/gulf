import { useEffect, useState } from 'react'

/**
 * Reactive `matchMedia`. Returns a stable initial value during SSR (`false`)
 * and subscribes to changes once mounted. Avoid for render-critical decisions
 * — lay out mobile-first in CSS and reach for this only for JS-driven ones.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false,
  )
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}
