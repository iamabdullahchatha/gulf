import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { NetworkTier } from '@/lib/network'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useNetworkTier } from '@/hooks/useNetworkTier'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Picture } from '@/components/Picture'

export interface VideoBackgroundProps {
  /** H.264/HEVC URL for desktop viewers. */
  src: string
  /** Lower-bitrate URL for small screens and slow connections. */
  srcSd?: string
  poster: string
  posterSmall?: string
  /**
   * - `eager`: fetch poster at page load, attach video immediately.
   * - `lazy` (default): poster is loaded lazily; video is attached when the
   *   element enters a ~1 viewport pre-load window.
   */
  loading?: 'eager' | 'lazy'
  /** Focal point (object-position) at desktop width. */
  focal?: string
  /** Focal point at ≤ 768 px. */
  mobileFocal?: string
  /** When false, phones stay on the poster — no video is downloaded. */
  mobileVideo?: boolean
  className?: string
}

const SD_BREAKPOINT = '(max-width: 900px)'
const MOBILE_BREAKPOINT = '(max-width: 768px)'
const STALL_TIMEOUT_MS = 15000

type Mode = 'auto' | 'manual' | 'none'
type State = 'idle' | 'loading' | 'playing' | 'paused' | 'poster' | 'fallback'

function computeMode(isMobile: boolean, mobileVideo: boolean, tier: NetworkTier, reduced: boolean): Mode {
  if (tier === 'none') return 'none'
  if (!mobileVideo && isMobile) return 'none'
  if (reduced) return 'manual'
  return 'auto'
}

/**
 * Background `<video>` with graceful fallbacks, lazy source attachment, and a
 * WCAG 2.2.2 pause control. User-visible text sits on the element above this
 * component — text is never baked into the clip.
 *
 * The mode (`auto`/`manual`/`none`) is derived from props and the user's
 * network/motion preferences. A `userMode` override wins once the viewer
 * interacts with the play button or autoplay is blocked.
 */
export function VideoBackground({
  src,
  srcSd,
  poster,
  posterSmall,
  loading = 'lazy',
  focal = '50% 50%',
  mobileFocal,
  mobileVideo = true,
  className,
}: VideoBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const stallRef = useRef<number | undefined>(undefined)

  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const isSdScreen = useMediaQuery(SD_BREAKPOINT)
  const tier = useNetworkTier()
  const reduced = usePrefersReducedMotion()

  // Derived mode (reactive to media queries). A user/runtime override — set
  // when autoplay is blocked or the viewer taps the pause/play control —
  // takes precedence.
  const [userMode, setUserMode] = useState<Mode | null>(null)
  const derivedMode = useMemo(() => computeMode(isMobile, mobileVideo, tier, reduced), [isMobile, mobileVideo, tier, reduced])
  const mode: Mode = userMode ?? derivedMode

  // Lazy initialisers keep the correct first-paint state without an effect.
  const initialAttached = mode === 'auto' && (loading === 'eager' || typeof IntersectionObserver === 'undefined')
  const [attached, setAttached] = useState<boolean>(initialAttached)
  const [inView, setInView] = useState<boolean>(typeof IntersectionObserver === 'undefined')
  const [userPaused, setUserPaused] = useState(false)
  const [state, setState] = useState<State>(mode === 'auto' ? 'idle' : 'poster')

  // Lazy pre-load window (only runs when we are in `auto` and not attached).
  useEffect(() => {
    if (mode !== 'auto' || attached) return
    const node = rootRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            setAttached(true)
            io.disconnect()
            break
          }
      },
      { rootMargin: '100% 0px 100% 0px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [mode, attached])

  // Visibility gate.
  useEffect(() => {
    const node = rootRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting && e.intersectionRatio >= 0.15)
      },
      { threshold: [0, 0.15, 0.5] },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  // Pause when the tab is hidden; the reconciler will resume when it comes back.
  useEffect(() => {
    const onVis = () => {
      const v = videoRef.current
      if (!v) return
      if (document.hidden && !v.paused) v.pause()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Reconciler: desired vs. actual playback.
  //
  // This effect translates React state into imperative media calls and, where
  // playback outcomes change what the user sees, writes derived state back.
  // That is the single legitimate place a `setState` inside an effect is
  // called for — hence the targeted rule disables below.
  useEffect(() => {
    const v = videoRef.current
    if (!v || !attached || state === 'fallback') return
    const want = mode === 'auto' && inView && !userPaused && !document.hidden
    if (want && v.paused) {
      setState("loading")
      window.clearTimeout(stallRef.current)
      stallRef.current = window.setTimeout(() => {
        if (videoRef.current && videoRef.current.paused) setState('fallback')
      }, STALL_TIMEOUT_MS)
      v.play().catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (err instanceof DOMException && err.name === 'NotSupportedError') {
          setState('fallback')
          return
        }
        // Autoplay blocked — keep poster, surface the manual play button.
        window.clearTimeout(stallRef.current)
        setUserMode('manual')
        setState('poster')
      })
    } else if (!want && !v.paused) {
      v.pause()
    } else if (!want && state === 'loading') {
      window.clearTimeout(stallRef.current)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState('idle')
    }
  }, [attached, mode, inView, userPaused, state])

  // Cleanup on unmount: release decoder and buffer. Capturing both refs at
  // the top of the effect keeps react-hooks/exhaustive-deps satisfied; the
  // video element itself is stable for the life of the component.
  useEffect(() => {
    const v = videoRef.current
    const stall = stallRef
    return () => {
      window.clearTimeout(stall.current)
      if (!v) return
      try { v.pause() } catch { /* noop */ }
      v.removeAttribute("src")
      try { v.load() } catch { /* frees the decoder */ }
    }
  }, [])

  const onToggle = useCallback(() => {
    if (state === 'fallback') return
    const v = videoRef.current
    if (!v) return
    if (!v.paused) {
      setUserPaused(true)
      v.pause()
      setState('paused')
    } else {
      setUserPaused(false)
      setUserMode('auto')
      setAttached(true)
      setInView(true)
    }
  }, [state])

  const chosenSrc = (isSdScreen && srcSd) || src
  const playing = state === 'playing'
  const buffering = state === 'loading'
  const showControl = (mode === 'auto' && (playing || state === 'paused')) || mode === 'manual'

  return (
    <div
      ref={rootRef}
      className={cn('absolute inset-0 overflow-hidden bg-navy-900', className)}
      aria-hidden="true"
      data-state={state}
      style={{ ['--focal' as string]: focal, ['--focal-mobile' as string]: mobileFocal ?? focal }}
    >
      <Picture
        src={poster}
        small={posterSmall}
        media={MOBILE_BREAKPOINT}
        loading={loading === 'eager' ? 'eager' : 'lazy'}
        fetchPriority={loading === 'eager' ? 'high' : undefined}
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: 'var(--focal, 50% 50%)' }}
      />
      <video
        ref={videoRef}
        muted
        playsInline
        loop
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        src={attached ? chosenSrc : undefined}
        tabIndex={-1}
        onPlaying={() => {
          window.clearTimeout(stallRef.current)
          setState('playing')
        }}
        onPause={() => setState((s) => (s === 'playing' ? 'paused' : s))}
        onWaiting={() => setState((s) => (s === 'playing' ? 'loading' : s))}
        onError={() => setState('fallback')}
        className={cn(
          'absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[1100ms] ease-[var(--ease-cinematic)]',
          playing && 'opacity-100',
        )}
        style={{ objectPosition: 'var(--focal, 50% 50%)' }}
      />

      {buffering && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
          <div className="absolute inset-y-0 w-1/3 animate-[sweep_1.4s_linear_infinite] bg-gradient-to-r from-transparent via-teal-400 to-transparent" />
        </div>
      )}

      {showControl && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={playing ? 'Pause background video' : 'Play background video'}
          aria-pressed={!playing}
          className="pointer-events-auto absolute bottom-6 right-6 z-[2] inline-flex size-11 items-center justify-center rounded-full border border-white/35 bg-navy-950/40 text-white backdrop-blur-md transition hover:border-white hover:bg-navy-950/60"
        >
          {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
        </button>
      )}

    </div>
  )
}
