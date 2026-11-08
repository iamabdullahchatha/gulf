import { type ElementType, type ReactNode, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface Props {
  id?: string
  as?: ElementType
  className?: string
  children: ReactNode
  /** CSS selector of children to animate. Defaults to direct `.reveal`s. */
  selector?: string
  /** Seconds between each child. */
  stagger?: number
  /** Initial vertical offset in px. */
  y?: number
  /** Where the animation starts relative to the viewport. */
  start?: string
  /** Delay before the stagger begins. */
  delay?: number
}

/**
 * Scroll-triggered entrance animation. Children marked with `.reveal` fade and
 * rise into view when the section crosses the trigger.
 *
 * Reduced motion: the animation is skipped; children render in their final
 * state via the `.reveal.is-in` class.
 */
export function AnimatedSection({
  as: Tag = 'section',
  className,
  id,
  children,
  selector = '.reveal',
  stagger = 0.08,
  y = 24,
  start = 'top 82%',
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const targets = root.querySelectorAll<HTMLElement>(selector)
      if (!targets.length) return

      if (reduced) {
        targets.forEach((t) => t.classList.add('is-in'))
        return
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: root, start, once: true },
          onComplete: () => targets.forEach((t) => t.classList.add('is-in')),
        },
      )
    },
    { scope: ref, dependencies: [reduced, selector, stagger, y, start, delay] },
  )

  return (
    <Tag ref={ref} id={id} className={cn(className)}>
      {children}
    </Tag>
  )
}
