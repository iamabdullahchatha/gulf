import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface Props {
  className?: string
  /** Pinned region. */
  children: ReactNode
  /** Scroll distance for the pin, as a viewport multiplier. 1 = 100vh. */
  pinLength?: number
  /** Disable pinning (useful for debugging the content). */
  pin?: boolean
}

/**
 * Pins a section while the user scrolls past it, parallaxing its children.
 * Used around chapter heroes to give them cinematic hold time without
 * occupying extra DOM height.
 *
 * Reduced motion: the pin is skipped; the section scrolls normally.
 */
export function ScrollScene({ className, children, pinLength = 1.4, pin = true }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      const root = ref.current
      if (!root || reduced || !pin) return
      const inner = root.querySelector<HTMLElement>('[data-scroll-scene-inner]')
      if (!inner) return

      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: () => `+=${window.innerHeight * pinLength}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      })

      gsap.to(inner, {
        yPercent: -6,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${window.innerHeight * pinLength}`,
          scrub: 0.4,
        },
      })
    },
    { scope: ref, dependencies: [reduced, pin, pinLength] },
  )

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div data-scroll-scene-inner className="relative will-change-transform">
        {children}
      </div>
    </div>
  )
}
