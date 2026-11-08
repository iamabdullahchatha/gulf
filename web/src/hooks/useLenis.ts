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

    // Lerp smoothing (Lenis' default) follows the wheel continuously; a fixed
    // `duration` restarts a 1.1 s ease on every wheel tick, which reads as lag
    // when it is layered over scroll-scrubbed video. Touch keeps native
    // momentum scrolling (syncTouch off) — the smoothest option on phones.
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, syncTouch: false })
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
