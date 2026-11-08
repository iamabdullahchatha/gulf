import { useEffect } from 'react'

/**
 * Lock the page scroll while `locked` is true, restoring both `overflow` and
 * scroll position on unlock. Used by the mobile menu overlay.
 */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return
    const scrollY = window.scrollY
    const { overflow, position, top, width } = document.body.style
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.overflow = overflow
      document.body.style.position = position
      document.body.style.top = top
      document.body.style.width = width
      window.scrollTo({ top: scrollY, behavior: 'instant' })
    }
  }, [locked])
}
