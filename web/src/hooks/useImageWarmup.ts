import { useEffect } from 'react'
import { getNetworkTier } from '@/lib/network'

/**
 * Photos ready before they scroll into view, in every browser.
 *
 * Native `loading="lazy"` waits until an image is close to the viewport, and
 * how close varies: Chrome starts ~1250px ahead, Safari and Firefox much
 * nearer, so on iPhones photos visibly pop in, and images in sideways
 * galleries (moved by transforms) are often only requested once on screen.
 *
 *  1. Every lazy image is promoted to eager once it is within 1.5 screens
 *     vertically or 1 screen horizontally, in any browser.
 *  2. On a fast connection, once the page has loaded and the browser is idle,
 *     the page's remaining lazy images are fetched a few at a time, in page
 *     order, at the browser's low image priority — so even a quick jump down
 *     the page lands on loaded photos. Skipped on Save-Data / slow networks.
 *  3. An image that does arrive while the page is already showing fades in
 *     softly (`.img-fade-in`) instead of popping; cached images appear as-is.
 *
 * Covers images added later too (route changes, menus) via MutationObserver.
 * Mount once at the app root.
 */
export function useImageWarmup(): void {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const tracked = new WeakSet<HTMLImageElement>()
    const lazy = new Set<HTMLImageElement>()

    const promote = (img: HTMLImageElement) => {
      lazy.delete(img)
      if (img.loading === 'lazy') img.loading = 'eager'
    }

    const near = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          near.unobserve(e.target)
          promote(e.target as HTMLImageElement)
        }
      },
      { rootMargin: '150% 100%' },
    )

    const track = (img: HTMLImageElement) => {
      if (tracked.has(img)) return
      tracked.add(img)
      if (!(img.complete && img.naturalWidth > 0)) {
        img.addEventListener('load', () => img.classList.add('img-fade-in'), { once: true })
      }
      if (img.loading === 'lazy') {
        lazy.add(img)
        near.observe(img)
      }
    }

    const scan = (root: ParentNode) => root.querySelectorAll('img').forEach(track)
    scan(document)
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n instanceof HTMLImageElement) track(n)
          else if (n instanceof Element) scan(n)
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    // Idle warm-up of everything else on the page.
    let stopped = false
    let timer = 0
    const idle = (fn: () => void): void => {
      if (typeof requestIdleCallback === 'function') requestIdleCallback(fn, { timeout: 2000 })
      else setTimeout(fn, 200)
    }
    const warm = () => {
      if (stopped) return
      for (const i of lazy) if (!i.isConnected) lazy.delete(i)
      const batch = [...lazy].slice(0, 4)
      if (!batch.length) {
        timer = window.setTimeout(() => idle(warm), 3000) // new images may mount on navigation
        return
      }
      batch.forEach((img) => {
        near.unobserve(img)
        promote(img)
      })
      void Promise.all(batch.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => undefined)))).then(() => {
        if (!stopped) idle(warm)
      })
    }
    const start = () => {
      if (getNetworkTier() === 'fast') timer = window.setTimeout(() => idle(warm), 1500)
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })

    return () => {
      stopped = true
      window.clearTimeout(timer)
      window.removeEventListener('load', start)
      near.disconnect()
      mo.disconnect()
    }
  }, [])
}
