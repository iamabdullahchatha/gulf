import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { jumpTo, scrollToElement } from '@/lib/lenis'

/**
 * Scrolls to the top on every route change. When the destination carries a
 * hash fragment, scrolls to that element instead once the (lazy) page has
 * rendered it, so links such as /about#values or #service-lines land in place.
 */
export function useScrollToTop(): void {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      jumpTo(0)
      return
    }
    const id = decodeURIComponent(hash.slice(1))
    let tries = 0
    let timer = 0
    const seek = () => {
      const el = document.getElementById(id)
      if (el) scrollToElement(el)
      else if (tries++ < 20) timer = window.setTimeout(seek, 100)
    }
    timer = window.setTimeout(seek, 60)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])
}
