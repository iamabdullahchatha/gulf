import { useCallback, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface Props {
  children: ReactNode
  className?: string
  /** Wrapper classes (perspective container). */
  wrapperClassName?: string
  /** Maximum rotation in degrees. */
  max?: number
  /** Adds a soft light that follows the pointer across the surface. */
  glare?: boolean
  /** Lift toward the viewer on hover, in px. */
  lift?: number
}

/**
 * 3D hover surface. The element tilts toward the pointer inside a perspective
 * container and keeps `transform-style: preserve-3d`, so children can float
 * at their own depth with `[transform:translateZ(40px)]`.
 *
 * Mouse only; touch and reduced-motion users get a static surface.
 */
export function Tilt3D({ children, className, wrapperClassName, max = 8, glare = true, lift = 18 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef<number | undefined>(undefined)
  const reduced = usePrefersReducedMotion()

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduced || e.pointerType !== 'mouse') return
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        el.style.transform = `rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(${lift}px)`
        el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`)
        el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`)
      })
    },
    [reduced, max, lift],
  )

  const onLeave = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current)
    if (ref.current) ref.current.style.transform = ''
  }, [])

  return (
    <div className={cn('[perspective:1200px]', wrapperClassName)}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={cn('group/tilt relative transition-transform duration-500 ease-[var(--ease-out-expo)] will-change-transform [transform-style:preserve-3d]', className)}
      >
        {children}
        {glare && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover/tilt:opacity-100"
            style={{ background: 'radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgb(255 255 255 / 0.6), transparent 50%)' }}
          />
        )}
      </div>
    </div>
  )
}
