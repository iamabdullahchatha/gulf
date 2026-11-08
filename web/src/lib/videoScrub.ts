/**
 * Shared engine for scroll-scrubbed video (the cinematic films and the
 * refinery section).
 *
 * Why it exists: setting `video.currentTime` on every scroll frame is only
 * smooth when
 *   1. the clip is already in memory (fetched once into a Blob),
 *   2. each seek lands on a *new* frame (sub-frame seeks cost a full decode
 *      but change nothing on screen),
 *   3. a new seek is never queued while the previous one is still decoding,
 *      and the playhead keeps moving meanwhile so a slow seek drops frames
 *      instead of falling behind the scroll,
 *   4. easing is time-based, so 60 Hz, 120 Hz and throttled mobile frames all
 *      feel the same.
 * The clips themselves are encoded with a keyframe every 4 frames and no
 * B-frames (`tools/scrub-encode.swift`), so a seek in either direction
 * decodes at most 3 extra frames.
 */

/** Frame rate of every encoded clip. */
export const CLIP_FPS = 24

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
    v.src = url
    if (v.readyState >= 2) done()
  })
}

/**
 * Downloads clips one at a time, always choosing the not-yet-loaded clip
 * closest to the one on screen (ties go forward, the usual scroll direction).
 * One-at-a-time matters on real connections: parallel downloads would make the
 * clip the viewer actually needs arrive last.
 */
export function createClipQueue(count: number, load: (index: number) => Promise<unknown>, opts: { window?: number } = {}) {
  const state: ('idle' | 'busy' | 'done')[] = Array.from({ length: count }, () => 'idle')
  let center = 0
  let busy = false
  let stopped = false

  const pick = (): number => {
    let best = -1
    let bestDist = Infinity
    for (let j = 0; j < count; j++) {
      if (state[j] !== 'idle') continue
      const d = j >= center ? j - center : (center - j) * 1.5
      if (opts.window !== undefined && Math.abs(j - center) > opts.window) continue
      if (d < bestDist) {
        bestDist = d
        best = j
      }
    }
    return best
  }

  const pump = () => {
    if (busy || stopped) return
    const j = pick()
    if (j < 0) return
    busy = true
    state[j] = 'busy'
    load(j)
      .catch(() => undefined)
      .finally(() => {
        state[j] = 'done'
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

/** True on devices with a precise pointer that can afford per-frame filters. */
export function richEffects(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
}
