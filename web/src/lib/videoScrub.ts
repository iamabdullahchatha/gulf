/**
 * Shared engine for scroll-scrubbed video (the cinematic films and the
 * refinery section).
 *
 * Smooth scrubbing needs the clip in memory: seeking a clip that is still
 * streaming stalls on network requests, and iOS will not buffer a paused video
 * ahead at all, so every clip is downloaded whole before it is shown. A
 * full-quality clip is 8–13 MB, though, and a first-time visitor scrolls
 * faster than that arrives — which is exactly the "frozen on the first scroll,
 * fine on the way back" bug. Each scene therefore loads in two tiers:
 *
 *   1. preview — 960x540, ~1.6 MB. Arrives in about a second on 4G, so the
 *      footage moves almost as soon as the page opens.
 *   2. full    — 720p, or 1080p on high-resolution screens with a fast
 *      connection. Crossfades in over the preview on the same frame, and the
 *      preview is freed.
 *
 * Download order adapts to the visitor's measured connection speed: on a fast
 * line each scene's full clip follows right behind its preview (the preview is
 * on screen for a moment at most); on a slow one the previews of the scenes
 * ahead come first, so the footage never freezes, and sharpness follows.

 * Seeking itself: each seek lands on a *new* frame only, a new seek is never
 * issued while one is still decoding (the playhead keeps moving, so a slow
 * seek drops frames instead of falling behind), and easing is time-based so
 * 60 Hz, 120 Hz and throttled phones feel the same. The clips are encoded
 * with a keyframe every 8 frames and no B-frames (`tools/scrub-encode.swift`),
 * so any seek, forwards or backwards, decodes at most 7 extra frames — measured
 * p95 under 9 ms, inside a single 60 Hz frame — while keeping the encode
 * efficient enough for full sharpness at sensible file sizes.
 */

import { FrameEngine, frameEngineSupported, type EngineState } from './frameEngine'

/** Frame rate of every encoded clip. */
export const CLIP_FPS = 24

/** Quality tiers, in load order. */
export const PREVIEW = 0
export const FULL = 1
export type Tier = typeof PREVIEW | typeof FULL

/** Download a whole clip into memory (null on failure), recording line speed. */
export async function fetchBytes(src: string, signal: AbortSignal): Promise<ArrayBuffer | null> {
  try {
    const started = performance.now()
    const r = await fetch(src, { signal })
    if (!r.ok) throw new Error(String(r.status))
    const buf = await r.arrayBuffer()
    recordThroughput(buf.byteLength, (performance.now() - started) / 1000)
    return buf
  } catch (err) {
    if (signal.aborted) throw err
    return null
  }
}

/**
 * Fetch a clip fully into memory and return an object URL for it, so every
 * later seek is served locally. Falls back to the network URL on failure.
 */
export async function fetchClip(src: string, signal: AbortSignal): Promise<{ url: string; blob: boolean }> {
  const buf = await fetchBytes(src, signal)
  if (!buf) return { url: src, blob: false }
  return { url: URL.createObjectURL(new Blob([buf], { type: 'video/mp4' })), blob: true }
}

/** Smoothed download speed in bytes per second, from the clips fetched so far (0 = unknown). */
let throughput = 0

function recordThroughput(bytes: number, seconds: number): void {
  // Ignore tiny/instant responses (served from cache) — they say nothing about the line.
  if (bytes < 200_000 || seconds <= 0.02) return
  const sample = bytes / seconds
  throughput = throughput ? throughput * 0.6 + sample * 0.4 : sample
}

/**
 * Attach a source to a video element and resolve once its first frame is
 * decoded. iOS only paints seeked frames after the element has played once,
 * so it is nudged with a muted play/pause.
 */
export function attachClip(v: HTMLVideoElement, url: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      v.play()
        .then(() => v.pause())
        .catch(() => undefined)
      resolve()
    }
    v.addEventListener('loadeddata', done, { once: true, signal })
    v.addEventListener('error', () => resolve(), { once: true, signal })
    v.src = url
    if (v.readyState >= 2) done()
  })
}

/**
 * Runs downloads one at a time, always picking the cheapest pending
 * (scene, tier): cost = distance from the scene on screen (scenes behind cost
 * 1.5× — people mostly scroll forwards) + a cost for the full tier that
 * depends on how long a full clip takes on this connection:
 *   - full clip in ≤ 1.5 s: preview 0, full 0, preview 1, full 1, …
 *   - ≤ 3.5 s:             preview 0, preview 1, full 0, preview 2, full 1, …
 *   - slower / unknown:    previews 0–4 first, then full quality nearest-first.
 * `fullBytes` is the approximate size of one full clip; `fullWindow` limits
 * full-quality downloads to nearby scenes (slow networks).
 */
export function createClipQueue(
  count: number,
  load: (index: number, tier: Tier) => Promise<unknown>,
  opts: { fullBytes: number; fullWindow?: number; signal?: AbortSignal },
) {
  // [preview done, full done] per scene.
  const state = Array.from({ length: count }, () => [false, false])
  let center = 0
  let busy = false
  let stopped = false
  /** Downloads begin once a scene has been asked for (focus) and the page has settled. */
  let wanted = false
  let open = false
  void pageSettled(opts.signal).then(() => {
    open = true
    pump()
  })

  const fullCost = () => {
    if (!throughput) return 4.5
    const seconds = opts.fullBytes / throughput
    return seconds <= 1.5 ? 0.5 : seconds <= 3.5 ? 1.5 : 4.5
  }

  const pick = (): [number, Tier] | null => {
    let best: [number, Tier] | null = null
    let bestCost = Infinity
    const extra = fullCost()
    for (let j = 0; j < count; j++) {
      const d = j >= center ? j - center : (center - j) * 1.5
      for (const tier of [PREVIEW, FULL] as const) {
        if (state[j]![tier]) continue
        if (tier === FULL && opts.fullWindow !== undefined && Math.abs(j - center) > opts.fullWindow) continue
        const cost = d + tier * extra
        if (cost < bestCost) {
          bestCost = cost
          best = [j, tier]
        }
      }
    }
    return best
  }

  const pump = () => {
    if (busy || stopped || !open || !wanted) return
    const next = pick()
    if (!next) return
    const [j, tier] = next
    busy = true
    state[j]![tier] = true
    load(j, tier)
      .catch(() => undefined)
      .finally(() => {
        busy = false
        pump()
      })
  }

  return {
    focus(index: number) {
      center = index
      wanted = true
      pump()
    },
    stop() {
      stopped = true
    },
  }
}

let settled: Promise<void> | null = null

/** Delay after the first film mounts before clips download on their own. */
const SETTLE_MS = 1500

/**
 * Resolves 1.5 s after the first film appears, or as soon as the visitor
 * scrolls, touches or presses a key — whichever is first. Clip downloads wait
 * for it, so megabytes of footage never compete with the scripts, fonts and
 * poster that paint the first screen. (The window `load` event is no use here:
 * the HTML is an app shell, so it fires before the page has even rendered.)
 * The poster already shows the opening frame, and a visitor who scrolls
 * straight away starts the downloads that instant, so nothing visible changes.
 */
export function pageSettled(signal?: AbortSignal): Promise<void> {
  settled ??= new Promise<void>((resolve) => {
    const events = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'] as const
    let timer = 0
    const done = () => {
      window.clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, done, true))
      resolve()
    }
    events.forEach((e) => window.addEventListener(e, done, { capture: true, passive: true, once: true }))
    timer = window.setTimeout(done, SETTLE_MS)
  })
  if (!signal) return settled
  return Promise.race([settled, new Promise<void>((r) => signal.addEventListener('abort', () => r(), { once: true }))])
}

/**
 * Moves a video's displayed frame towards a target time with frame-rate
 * independent easing. `ease` keeps its historic meaning: the share of the
 * remaining distance covered per 60 Hz frame (0–1; lower is silkier).
 */
export function createScrubber(v: HTMLVideoElement, ease: number) {
  const frame = 1 / CLIP_FPS
  let target = 0
  let pos = -1
  let shown = -1
  let ready = false

  return {
    /** Target time in seconds. */
    set(t: number) {
      target = t
    },
    markReady() {
      ready = true
      pos = target // land on the right frame immediately, no long sweep from 0
      shown = -1
    },
    /** Advance by `dt` seconds. Call once per animation frame while visible. */
    tick(dt: number) {
      if (!ready) return
      if (pos < 0) pos = target
      const k = 1 - Math.pow(1 - ease, Math.min(dt, 0.1) * 60)
      pos += (target - pos) * k
      if (Math.abs(target - pos) < frame * 0.25) pos = target
      // A seek is still decoding: keep moving the playhead, issue nothing.
      if (v.seeking) return
      const dur = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : Infinity
      const f = Math.round(pos * CLIP_FPS)
      if (f === shown) return
      shown = f
      // Aim at the middle of the frame so rounding never lands on its neighbour.
      v.currentTime = Math.max(0, Math.min(dur - frame * 0.5, (f + 0.5) * frame))
    },
  }
}

/** Resolve on the element's next `seeked`, or after `ms` at the latest. */
function nextSeeked(v: HTMLVideoElement, ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const t = window.setTimeout(resolve, ms)
    v.addEventListener(
      'seeked',
      () => {
        window.clearTimeout(t)
        resolve()
      },
      { once: true, signal },
    )
  })
}

/**
 * <video> fallback for browsers without WebCodecs: two stacked elements,
 * `preview` below and `full` above (both start at opacity 0 over the poster),
 * driven by seeking.
 */
function createVideoLayer(els: { preview: HTMLVideoElement; full: HTMLVideoElement }, ease: number, signal: AbortSignal, onLive?: () => void) {
  const scrub = { preview: createScrubber(els.preview, ease), full: createScrubber(els.full, ease) }
  const urls: string[] = []
  let previewOn = false
  let fullOn = false
  let visible = false

  const show = (v: HTMLVideoElement) => {
    v.style.opacity = '1'
    onLive?.()
  }
  const releasePreview = () => {
    previewOn = false
    els.preview.removeAttribute('src')
    els.preview.load()
  }

  return {
    set(t: number) {
      scrub.preview.set(t)
      scrub.full.set(t)
    },
    /** Call every animation frame; `isVisible` is whether the shot is on screen. */
    tick(dt: number, isVisible: boolean) {
      visible = isVisible
      if (!isVisible) return
      if (fullOn) scrub.full.tick(dt)
      if (previewOn) scrub.preview.tick(dt)
    },
    async load(tier: Tier, src: string) {
      if (tier === PREVIEW && fullOn) return // full quality is already here; skip the download
      const clip = await fetchClip(src, signal)
      if (clip.blob) urls.push(clip.url)
      if (tier === PREVIEW) {
        if (fullOn) return // full quality beat it here; nothing to do
        await attachClip(els.preview, clip.url, signal)
        if (signal.aborted || fullOn) return
        scrub.preview.markReady()
        previewOn = true
        show(els.preview)
        return
      }
      await attachClip(els.full, clip.url, signal)
      if (signal.aborted) return
      scrub.full.markReady()
      fullOn = true
      if (previewOn && visible) {
        // On screen: wait until the full clip shows the current frame, then
        // crossfade over the preview and free it once the fade has finished.
        await nextSeeked(els.full, 400, signal)
        if (signal.aborted) return
        show(els.full)
        window.setTimeout(() => !signal.aborted && releasePreview(), 600)
      } else {
        els.full.style.transition = 'none'
        show(els.full)
        if (previewOn) releasePreview()
      }
    },
    duration(): number | undefined {
      for (const v of [els.full, els.preview]) if (Number.isFinite(v.duration) && v.duration > 0) return v.duration
      return undefined
    },
    destroy() {
      for (const v of [els.preview, els.full]) {
        v.removeAttribute('src')
        v.load()
      }
      urls.forEach((u) => URL.revokeObjectURL(u))
    },
  }
}

export type LayerState = EngineState

/**
 * One scrubbed shot. With WebCodecs (Chrome, Edge, Safari 16.4+, Firefox 130+)
 * it renders on `canvas` through `FrameEngine`: frame-exact, blended between
 * frames, never waiting on a seek. Anywhere else, or if decoding fails at
 * runtime, it falls back to the stacked <video> elements on the same frame.
 *
 * `tick` takes the layer's state: `visible` (on screen), `warm` (next to
 * appear: decode and paint its target frame while hidden) or `cold`.
 */
export function createScrubLayer(
  els: { preview: HTMLVideoElement; full: HTMLVideoElement; canvas?: HTMLCanvasElement | null },
  ease: number,
  signal: AbortSignal,
  onLive?: () => void,
) {
  const video = createVideoLayer(els, ease, signal, onLive)
  const canvas = els.canvas
  let engine: FrameEngine | null = null
  let lastT = 0
  let best: { tier: Tier; src: string } | null = null

  const fallBack = () => {
    if (!engine) return
    engine.destroy()
    engine = null
    // The canvas keeps its last picture underneath until the video fades in over it.
    video.set(lastT)
    if (best && !signal.aborted) void video.load(best.tier, best.src)
  }

  if (canvas && frameEngineSupported()) {
    engine = new FrameEngine(
      canvas,
      ease,
      () => {
        canvas.style.opacity = '1'
        onLive?.()
      },
      fallBack,
    )
  }

  return {
    set(t: number) {
      lastT = t
      if (engine) engine.set(t)
      else video.set(t)
    },
    /** Call every animation frame. A boolean means visible / cold. */
    tick(dt: number, state: LayerState | boolean) {
      const s: LayerState = state === true ? 'visible' : state === false ? 'cold' : state
      if (engine) engine.tick(dt, s)
      else video.tick(dt, s === 'visible')
    },
    async load(tier: Tier, src: string) {
      if (engine) {
        if (tier === PREVIEW && best?.tier === FULL) return
        const bytes = await fetchBytes(src, signal)
        if (signal.aborted) return
        if (engine && bytes) {
          try {
            await engine.load(bytes)
            if (!best || tier >= best.tier) best = { tier, src }
            return
          } catch {
            best = { tier, src }
            fallBack()
            return
          }
        }
        best = { tier, src }
        fallBack()
        return
      }
      await video.load(tier, src)
    },
    /** Clip length in seconds, once known. */
    duration(): number | undefined {
      return engine?.duration ?? video.duration()
    },
    destroy() {
      engine?.destroy()
      engine = null
      video.destroy()
    },
  }
}

/** True on devices with a precise pointer that can afford per-frame filters. */
export function richEffects(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/**
 * Which full-quality source to use. 1080p whenever the screen is at least
 * ~1600 physical pixels wide on a fast connection — CSS width alone would
 * hand 720p to Retina laptops, which then upscale it to 2–3× and look soft.
 * Phones (≈1200 physical px) keep 720p, which is sharp at their size.
 */
export function pickFull(sources: { hd: string; sd: string }, fast: boolean): string {
  if (!fast) return sources.sd
  const px = Math.max(window.screen?.width ?? 0, window.innerWidth) * (window.devicePixelRatio || 1)
  return px >= 1600 ? sources.hd : sources.sd
}
