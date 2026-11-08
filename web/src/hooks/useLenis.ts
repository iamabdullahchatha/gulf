import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { registerLenis } from '@/lib/lenis'

/**
 * Initialise Lenis smooth scrolling and tie it to GSAP's ticker so
 * ScrollTrigger measurements stay in sync. Mount once at the app root.
 *
 * Disabled when the user prefers reduced motion — native scroll is honoured.
 */
export function useLenis(): void {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return

    const lenis = new Lenis({ autoRaf: false, duration: 1.1 })
    registerLenis(lenis)
    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.off('scroll', onScroll)
      registerLenis(null)
      lenis.destroy()
    }
  }, [reduced])
}
