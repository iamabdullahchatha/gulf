/**
 * Frame-accurate, scroll-driven video on a <canvas>, decoded with WebCodecs.
 *
 * Why not `video.currentTime`? Every seek on a <video> element is an
 * asynchronous round trip through the media pipeline: the browser flushes its
 * decoder, decodes from the previous keyframe and presents the frame some time
 * later. Desktop Chrome hides that reasonably well; iOS Safari, Android and
 * Firefox do not, which is the stutter people see when scrubbing.
 *
 * Here the clip's encoded frames sit in memory (demuxed by `lib/mp4`), and a
 * `VideoDecoder` turns them into GPU-backed bitmaps a GOP (8 frames) at a
 * time. Each animation frame draws the bitmap for the exact scroll position
 * synchronously, so the picture can never lag behind or tear against the
 * scroll. Between two frames the next one is blended in by the fractional
 * position, so 24 fps footage glides at 60/120 Hz instead of stepping.
 *
 * Decoding is predictive: it starts with the GOP where the eased playhead will
 * be by the time decoding finishes, then fills the path to the scroll target,
 * then a little ahead in the direction of travel and one GOP behind. Decoded
 * frames live in a small window that is sized from one memory budget shared by
 * every engine on the page (larger on desktops, conservative on phones);
 * anything outside it is closed straight away. Off-screen engines release
 * everything but keep their last picture on the canvas, so scrolling back
 * shows the right frame immediately.
 *
 * The canvas is sized to the clip's own resolution and scaled by CSS
 * `object-fit: cover`, exactly as the <video> was: same pixels, same crop.
 */
import { demuxMp4, type Mp4VideoTrack } from './mp4'

/** visible: on screen · warm: about to be (decode the target GOP, draw it) · cold: free everything. */
export type EngineState = 'visible' | 'warm' | 'cold'

type Img = ImageBitmap | HTMLCanvasElement

interface Frame {
  img: Img
  gen: number
}

interface Generation {
  id: number
  track: Mp4VideoTrack
  bytes: Uint8Array
  config: VideoDecoderConfig
  tsIndex: Map<number, number>
}

/** Blend steps between two frames (quantised so a still frame costs nothing). */
const BLEND_STEPS = 64

const engines = new Set<FrameEngine>()
let budgetBytes = 0
let bitmapOk: boolean | null = null

/** True when this browser can run the canvas engine at all. */
export function frameEngineSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof VideoDecoder !== 'undefined' &&
    typeof EncodedVideoChunk !== 'undefined' &&
    typeof VideoFrame !== 'undefined' &&
    typeof VideoDecoder.isConfigSupported === 'function'
  )
}

/** Decoded-frame memory shared by all engines on the page. */
function budget(): number {
  if (budgetBytes) return budgetBytes
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? (coarse ? 4 : 8)
  const mb = coarse ? (mem >= 8 ? 200 : mem >= 4 ? 140 : 90) : mem >= 8 ? 420 : 260
  budgetBytes = mb * 1024 * 1024
  return budgetBytes
}

async function toImage(frame: VideoFrame): Promise<Img> {
  if (bitmapOk !== false) {
    try {
      const b = await createImageBitmap(frame)
      frame.close()
      bitmapOk = true
      return b
    } catch {
      bitmapOk = false
    }
  }
  // Browsers without createImageBitmap(VideoFrame): copy into a canvas so the
  // decoder's own output buffer is returned at once (holding VideoFrames
  // stalls hardware decoders).
  const c = document.createElement('canvas')
  c.width = frame.displayWidth
  c.height = frame.displayHeight
  c.getContext('2d')?.drawImage(frame, 0, 0)
  frame.close()
  return c
}

function closeImg(img: Img): void {
  if ('close' in img) img.close()
  else img.width = 0
}

export class FrameEngine {
  private readonly ctx: CanvasRenderingContext2D | null
  private gen: Generation | null = null
  private genSeq = 0
  private readonly frames = new Map<number, Frame>()
  private keep = new Set<number>()
  private decoder: VideoDecoder | null = null
  private decoderGen = -1
  private conversions: Promise<void>[] = []
  private busy = false
  private destroyed = false
  private failed = false
  private target = 0
  private pos = -1
  private dir = 1
  state: EngineState = 'cold'
  /** Moving average of one GOP decode, in ms (drives the look-ahead). */
  private jobMs = 30
  private drawnKey = ''
  private drewOnce = false

  private readonly canvas: HTMLCanvasElement
  private readonly ease: number
  private readonly onFirstDraw?: () => void
  private readonly onError?: (err: unknown) => void

  constructor(canvas: HTMLCanvasElement, ease: number, onFirstDraw?: () => void, onError?: (err: unknown) => void) {
    this.canvas = canvas
    this.ease = ease
    this.onFirstDraw = onFirstDraw
    this.onError = onError
    this.ctx = canvas.getContext('2d', { alpha: false })
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = true
      this.ctx.imageSmoothingQuality = 'high'
    }
    engines.add(this)
  }

  /** Clip length in seconds, once a source is loaded. */
  get duration(): number | undefined {
    return this.gen?.track.duration
  }

  /**
   * Use a clip (whole MP4 file in memory). A later call swaps in a sharper
   * source on the same frame: the old frames keep drawing until the new ones
   * are decoded. Rejects if the clip or codec is unsupported.
   */
  async load(buffer: ArrayBuffer): Promise<void> {
    if (!this.ctx) throw new Error('no 2d context')
    const track = demuxMp4(buffer)
    const config: VideoDecoderConfig = {
      codec: track.codec,
      description: track.description,
      codedWidth: track.width,
      codedHeight: track.height,
      optimizeForLatency: true,
    }
    const support = await VideoDecoder.isConfigSupported(config)
    if (!support.supported) throw new Error(`unsupported ${track.codec}`)
    if (this.destroyed) return
    const tsIndex = new Map<number, number>()
    track.samples.forEach((s, i) => tsIndex.set(s.ts, i))
    this.closeDecoder()
    this.gen = { id: ++this.genSeq, track, bytes: new Uint8Array(buffer), config, tsIndex }
    if (this.canvas.width !== track.width || this.canvas.height !== track.height) {
      this.canvas.width = track.width
      this.canvas.height = track.height
      this.ctx.imageSmoothingQuality = 'high'
      this.drawnKey = ''
      this.draw() // repaint at once with whatever frames exist, so the resize never flashes
    }
    if (this.pos < 0) this.pos = this.target
    this.pump()
  }

  /** Target time in seconds. */
  set(t: number): void {
    this.target = t
  }

  /** Call once per animation frame. */
  tick(dt: number, state: EngineState): void {
    if (this.destroyed || this.failed) return
    const prev = this.state
    this.state = state
    if (state === 'cold') {
      if (prev !== 'cold') this.release()
      return
    }
    const gen = this.gen
    if (!gen) return
    if (this.pos < 0 || state === 'warm') {
      this.pos = this.target
    } else {
      const k = 1 - Math.pow(1 - this.ease, Math.min(dt, 0.1) * 60)
      this.pos += (this.target - this.pos) * k
      if (Math.abs(this.target - this.pos) < 0.02 / gen.track.fps) this.pos = this.target
    }
    if (Math.abs(this.target - this.pos) > 1e-4) this.dir = this.target > this.pos ? 1 : -1
    this.draw()
    this.pump()
  }

  destroy(): void {
    this.destroyed = true
    this.release()
    this.gen = null
    engines.delete(this)
  }

  /* ------------------------------------------------------------------------ */

  private frameAt(sec: number): number {
    const t = this.gen!.track
    return Math.min(t.samples.length - 1, Math.max(0, Math.floor(sec * t.fps)))
  }

  private gopOf(frame: number): number {
    const keys = this.gen!.track.keyframes
    let lo = 0
    let hi = keys.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (keys[mid]! <= frame) lo = mid
      else hi = mid - 1
    }
    return lo
  }

  private gopRange(g: number): [number, number] {
    const t = this.gen!.track
    return [t.keyframes[g]!, t.keyframes[g + 1] ?? t.samples.length]
  }

  private gopReady(g: number): boolean {
    const id = this.gen!.id
    const [s, e] = this.gopRange(g)
    for (let i = s; i < e; i++) if (this.frames.get(i)?.gen !== id) return false
    return true
  }

  /** How many GOPs this engine may hold, from the shared budget. */
  private allowedGops(): number {
    const t = this.gen!.track
    const gopLen = t.samples.length / t.keyframes.length
    const total = budget() / (t.width * t.height * 4)
    let visible = 0
    let warm = 0
    for (const e of engines) {
      if (e.state === 'visible') visible++
      else if (e.state === 'warm') warm++
    }
    const share = (total - warm * gopLen) / Math.max(1, visible)
    return Math.max(2, Math.min(6, Math.floor(share / gopLen)))
  }

  /** Next GOP to decode (and refresh the keep window), or null. */
  private pickGop(): number | null {
    const gen = this.gen!
    const G = gen.track.keyframes.length
    const order: number[] = []
    const push = (g: number) => {
      if (g >= 0 && g < G && !order.includes(g)) order.push(g)
    }

    if (this.state === 'warm') {
      push(this.gopOf(this.frameAt(this.target)))
    } else {
      // Where the eased playhead will be once this decode has finished.
      const k = Math.pow(1 - this.ease, (60 * this.jobMs) / 1000)
      const future = this.target + (this.pos - this.target) * k
      const gNow = this.gopOf(this.frameAt(this.pos))
      const gFut = this.gopOf(this.frameAt(future))
      const gTgt = this.gopOf(this.frameAt(this.target))
      const d = this.dir
      push(gNow)
      push(gFut)
      push(gTgt)
      for (let g = gFut + d; d > 0 ? g < gTgt : g > gTgt; g += d) push(g)
      push(gTgt + d) // blend partner / next shot ahead
      push(gNow - d) // instant reversal
      for (let i = 2; i <= 4; i++) push(gTgt + d * i)
    }

    const wanted = order.slice(0, this.state === 'warm' ? 1 : this.allowedGops())
    this.keep = new Set(wanted)
    this.evict()
    for (const g of wanted) if (!this.gopReady(g)) return g
    return null
  }

  private evict(): void {
    if (!this.gen) return
    for (const [i, f] of this.frames) {
      if (this.keep.has(this.gopOf(i))) continue
      closeImg(f.img)
      this.frames.delete(i)
    }
  }

  private pump(): void {
    if (this.busy || this.destroyed || this.failed || !this.gen || this.state === 'cold') return
    const g = this.pickGop()
    if (g === null) return
    this.busy = true
    const started = performance.now()
    this.decodeGop(g)
      .then(() => {
        this.jobMs = this.jobMs * 0.7 + (performance.now() - started) * 0.3
      })
      .catch((err: unknown) => this.fail(err))
      .finally(() => {
        this.busy = false
        if (!this.destroyed && this.state !== 'cold') {
          this.draw()
          this.pump()
        }
      })
  }

  private async decodeGop(g: number): Promise<void> {
    const gen = this.gen!
    const dec = this.ensureDecoder(gen)
    const [s, e] = this.gopRange(g)
    for (let i = s; i < e; i++) {
      const smp = gen.track.samples[i]!
      dec.decode(
        new EncodedVideoChunk({
          type: i === s ? 'key' : 'delta',
          timestamp: smp.ts,
          duration: smp.dur,
          data: gen.bytes.subarray(smp.offset, smp.offset + smp.size),
        }),
      )
    }
    await dec.flush()
    const pending = this.conversions
    this.conversions = []
    await Promise.all(pending)
  }

  private ensureDecoder(gen: Generation): VideoDecoder {
    if (this.decoder && this.decoderGen === gen.id && this.decoder.state === 'configured') return this.decoder
    this.closeDecoder()
    const dec = new VideoDecoder({
      output: (frame) => this.onOutput(frame, gen),
      error: (err) => this.fail(err),
    })
    dec.configure(gen.config)
    this.decoder = dec
    this.decoderGen = gen.id
    return dec
  }

  private onOutput(frame: VideoFrame, gen: Generation): void {
    const idx = gen.tsIndex.get(frame.timestamp)
    if (idx === undefined || this.destroyed || this.state === 'cold') {
      frame.close()
      return
    }
    this.conversions.push(
      toImage(frame).then((img) => {
        if (this.destroyed || this.state === 'cold') return closeImg(img)
        const old = this.frames.get(idx)
        if (old) closeImg(old.img)
        this.frames.set(idx, { img, gen: gen.id })
      }),
    )
  }

  private closeDecoder(): void {
    const dec = this.decoder
    this.decoder = null
    this.decoderGen = -1
    if (dec && dec.state !== 'closed') {
      try {
        dec.close()
      } catch {
        /* already closed */
      }
    }
  }

  /** Free every decoded frame and the decoder; the canvas keeps its picture. */
  private release(): void {
    this.closeDecoder()
    for (const f of this.frames.values()) closeImg(f.img)
    this.frames.clear()
    this.keep.clear()
  }

  private fail(err: unknown): void {
    // Our own close()/reset() aborts in-flight work; that is not a failure.
    if (this.destroyed || this.failed || (err instanceof DOMException && err.name === 'AbortError')) return
    if (this.state === 'cold' && !this.decoder) return
    this.failed = true
    this.release()
    this.onError?.(err)
  }

  private nearest(a: number): number | null {
    let best: number | null = null
    let bestD = Infinity
    for (const i of this.frames.keys()) {
      const d = Math.abs(i - a)
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    return best
  }

  private draw(): void {
    const gen = this.gen
    const ctx = this.ctx
    if (!gen || !ctx) return
    const n = gen.track.samples.length
    const x = Math.min(n - 1, Math.max(0, this.pos * gen.track.fps))
    let a = Math.floor(x)
    let fa = this.frames.get(a)
    let fb: Frame | undefined
    let q = 0
    if (fa) {
      q = Math.round((x - a) * BLEND_STEPS)
      if (q > 0) fb = this.frames.get(a + 1)
      if (!fb) q = 0
    } else {
      const near = this.nearest(a)
      if (near === null) return
      a = near
      fa = this.frames.get(near)!
    }
    const key = `${a}.${fa.gen}|${q}.${fb?.gen ?? 0}`
    if (key === this.drawnKey) return
    this.drawnKey = key
    const W = this.canvas.width
    const H = this.canvas.height
    ctx.globalAlpha = 1
    ctx.drawImage(fa.img, 0, 0, W, H)
    if (fb && q > 0) {
      ctx.globalAlpha = q / BLEND_STEPS
      ctx.drawImage(fb.img, 0, 0, W, H)
      ctx.globalAlpha = 1
    }
    if (!this.drewOnce) {
      this.drewOnce = true
      this.onFirstDraw?.()
    }
  }
}
