/**
 * Shared engine for scroll-scrubbed video (the cinematic films and the
 * refinery section).
 *
 * Smooth scrubbing needs the clip in memory: seeking a clip that is still
 * streaming stalls on network requests, and iOS will not buffer a paused video
 * ahead at all. But a full-quality clip is 6–11 MB, so on a first visit the
 * viewer would scroll through still posters while it downloads. Each scene
 * therefore loads in two tiers:
 *
 *   1. preview — 640x360, under 1 MB. Arrives in well under a second on 4G,
 *      so the footage moves almost as soon as the page opens.
 *   2. full    — 720p (1080p on large fast screens). Downloads behind the
 *      preview, then crossfades in on the same frame and the preview is freed.
 *
 * Downloads run one at a time in priority order — the previews of the scene
 * on screen and the ones ahead first (they are what keeps the footage moving
 * however fast someone scrolls), then full quality nearest-first.
 *
 * Seeking itself: each seek lands on a *new* frame only, a new seek is never
 * issued while one is still decoding (the playhead keeps moving, so a slow
 * seek drops frames instead of falling behind), and easing is time-based so
 * 60 Hz, 120 Hz and throttled phones feel the same. The clips are encoded
 * with a keyframe every 4 frames and no B-frames (`tools/scrub-encode.swift`),
 * so any seek, forwards or backwards, decodes at most 3 extra frames.
 */

/** Frame rate of every encoded clip. */
export const CLIP_FPS = 24

/** Quality tiers, in load order. */
export const PREVIEW = 0
export const FULL = 1
export type Tier = typeof PREVIEW | typeof FULL

/**
 * Fetch a clip fully into memory and return an object URL for it, so every
 * later seek is served locally. Falls back to the network URL on failure.
 */
export async function fetchClip(src: string, signal: AbortSignal): Promise<{ url: string; blob: boolean }> {
  try {
    const r = await fetch(src, { signal })
    if (!r.ok) throw new Error(String(r.status))
    return { url: URL.createObjectURL(await r.blob()), blob: true }
  } catch (err) {
    if (signal.aborted) throw err
    return { url: src, blob: false }
  }
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
 * 1.5× — people mostly scroll forwards) + FULL_COST for the full tier. Previews
 * are ~1 MB and full clips 6–11 MB, so at scene 0 this yields: previews 0–4,
 * full 0, preview 5, full 1, … — motion everywhere first, then sharpness.
 * `fullWindow` limits full-quality downloads to nearby scenes (slow networks).
 */
const FULL_COST = 4.5

export function createClipQueue(count: number, load: (index: number, tier: Tier) => Promise<unknown>, opts: { fullWindow?: number } = {}) {
  const state = Array.from({ length: count }, () => [false, false])
  let center = 0
  let busy = false
  let stopped = false

  const pick = (): [number, Tier] | null => {
    let best: [number, Tier] | null = null
    let bestCost = Infinity
    for (let j = 0; j < count; j++) {
      const d = j >= center ? j - center : (center - j) * 1.5
      for (const tier of [PREVIEW, FULL] as const) {
        if (state[j]![tier]) continue
        if (tier === FULL && opts.fullWindow !== undefined && Math.abs(j - center) > opts.fullWindow) continue
        const cost = d + tier * FULL_COST
        if (cost < bestCost) {
          bestCost = cost
          best = [j, tier]
        }
      }
    }
    return best
  }

  const pump = () => {
    if (busy || stopped) return
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
      pump()
    },
    stop() {
      stopped = true
    },
  }
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
 * One scrubbed shot backed by two stacked <video> elements: `preview` below,
 * `full` above (both start at opacity 0 over the poster).
 */
export function createScrubLayer(els: { preview: HTMLVideoElement; full: HTMLVideoElement }, ease: number, signal: AbortSignal, onLive?: () => void) {
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
    destroy() {
      for (const v of [els.preview, els.full]) {
        v.removeAttribute('src')
        v.load()
      }
      urls.forEach((u) => URL.revokeObjectURL(u))
    },
  }
}

/** True on devices with a precise pointer that can afford per-frame filters. */
export function richEffects(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/** Which full-quality source to use: 1080p only on large screens with a fast connection. */
export function pickFull(sources: { hd: string; sd: string }, fast: boolean): string {
  return fast && window.matchMedia('(min-width: 1400px)').matches ? sources.hd : sources.sd
}
