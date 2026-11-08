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
