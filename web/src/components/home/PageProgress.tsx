import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Hairline reading-progress bar along the top edge of the viewport. */
export function PageProgress() {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (bar.current) bar.current.style.transform = `scaleX(${self.progress.toFixed(4)})`
      },
    })
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 800)
    return () => {
      window.clearTimeout(t)
      st.kill()
    }
  }, [])
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5">
      <div ref={bar} className="h-full origin-left bg-gradient-to-r from-emerald via-electric to-emerald" style={{ transform: 'scaleX(0)' }} />
    </div>
  )
}
