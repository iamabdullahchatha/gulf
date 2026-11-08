import { useCallback, useRef } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * Subtle 3D tilt that follows the pointer. Returns props to spread on the
 * element. Max rotation is deliberately small (default 5°) — a hint of depth,
 * not a gimmick. Disabled for reduced motion and coarse pointers.
 */
export function useTilt<T extends HTMLElement>(max = 5) {
  const ref = useRef<T>(null)
  const frame = useRef<number | undefined>(undefined)
  const reduced = usePrefersReducedMotion()

  const onPointerMove = useCallback(
    (e: React.PointerEvent<T>) => {
      if (reduced || e.pointerType !== 'mouse') return
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      if (frame.current) cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`
        el.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`)
        el.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`)
      })
    },
    [max, reduced],
  )

  const onPointerLeave = useCallback(() => {
    const el = ref.current
    if (frame.current) cancelAnimationFrame(frame.current)
    if (el) el.style.transform = ''
  }, [])

  return { ref, onPointerMove, onPointerLeave }
}
