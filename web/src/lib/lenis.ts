import type Lenis from 'lenis'

/**
 * Shared handle to the page's Lenis instance (registered by `useLenis`), so
 * components such as the homepage chapter navigation can scroll smoothly
 * without owning the scroll engine.
 */
let instance: Lenis | null = null

export function registerLenis(l: Lenis | null): void {
  instance = l
}

/** Smoothly scroll to an element, falling back to native scrolling. */
export function scrollToElement(el: HTMLElement, offset = 0): void {
  if (instance) {
    instance.scrollTo(el, { offset, duration: 1.4 })
    return
  }
  const top = el.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: 'smooth' })
}

/**
 * Jump to a scroll position instantly. Goes through Lenis when it is running,
 * otherwise Lenis would keep easing towards its previous target and drag the
 * page back after a route change.
 */
export function jumpTo(top: number): void {
  if (instance) instance.scrollTo(top, { immediate: true, force: true })
  else window.scrollTo({ top, left: 0, behavior: 'instant' })
}

/** Pause / resume smooth scrolling (e.g. while a full-screen menu is open). */
export function setLenisPaused(paused: boolean): void {
  if (!instance) return
  if (paused) instance.stop()
  else instance.start()
}
