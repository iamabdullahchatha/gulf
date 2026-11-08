import { Component, Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react'
import { Picture } from '@/components/Picture'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/** Props every lazily loaded scene module receives. */
export interface SceneProps {
  /** False while the canvas is off-screen: scenes stop their render loop. */
  active: boolean
  /** Reduced motion: scenes render a still frame without auto animation. */
  still: boolean
  /** 0–1 scroll progress through `scrollTarget`, written by the wrapper. */
  scroll: { current: number }
  /** Called once the first frame has rendered, to fade out the fallback. */
  onReady: () => void
}

let webgl: boolean | undefined
function hasWebGL() {
  if (webgl !== undefined) return webgl
  try {
    const c = document.createElement('canvas')
    webgl = Boolean(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    webgl = false
  }
  return webgl
}

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

interface Props<P> {
  /** A module-level `lazy(() => import(...))` scene component. */
  scene: LazyExoticComponent<ComponentType<SceneProps & P>>
  /** Shown before the scene loads, when WebGL is unavailable, or if it fails. */
  fallback: { src: string; small?: string; alt: string }
  /** Element whose scroll progress feeds `scroll` (defaults to the wrapper). */
  scrollTarget?: React.RefObject<HTMLElement | null>
  sceneProps?: P
  className?: string
  children?: ReactNode
}

/**
 * Mounts a WebGL scene only when it nears the viewport, pauses it while
 * off-screen, and keeps a photograph underneath until the first frame lands.
 * Without WebGL, or if the scene throws, the photograph simply stays.
 */
export function Scene3D<P extends object>({ scene: Scene, fallback, scrollTarget, sceneProps, className, children }: Props<P>) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = useRef(0)
  const still = usePrefersReducedMotion()
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)
  const [supported] = useState(() => typeof document !== 'undefined' && hasWebGL())

  useEffect(() => {
    const el = ref.current
    if (!el || !supported) return
    const preload = new IntersectionObserver(([e]) => e?.isIntersecting && setNear(true), { rootMargin: '400px 0px' })
    const onScreen = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting)), { rootMargin: '80px 0px' })
    preload.observe(el)
    onScreen.observe(el)
    return () => {
      preload.disconnect()
      onScreen.disconnect()
    }
  }, [supported])

  useEffect(() => {
    if (!near) return
    const el = scrollTarget?.current ?? ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const span = r.height + window.innerHeight
      scroll.current = Math.min(1, Math.max(0, (window.innerHeight - r.top) / span))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [near, scrollTarget])

  const image = <Picture src={fallback.src} small={fallback.small} alt={fallback.alt} className="absolute inset-0 h-full w-full object-cover" />

  return (
    <div ref={ref} className={cn('relative isolate overflow-hidden', className)}>
      <div className={cn('absolute inset-0 transition-opacity duration-1000', ready ? 'opacity-0' : 'opacity-100')}>{image}</div>
      {supported && near && (
        <div aria-hidden className={cn('absolute inset-0 transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}>
          <Boundary fallback={null}>
            <Suspense fallback={null}>
              <Scene {...(sceneProps as P)} active={visible} still={still} scroll={scroll} onReady={() => setReady(true)} />
            </Suspense>
          </Boundary>
        </div>
      )}
      {children}
    </div>
  )
}
