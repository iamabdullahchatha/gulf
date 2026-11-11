/**
 * Minimal MP4 demuxer for the site's own H.264 clips.
 *
 * Reads just enough of the `moov` box to hand every encoded frame to a
 * WebCodecs `VideoDecoder`: the avcC decoder configuration, and each sample's
 * byte range, timing and keyframe flag. The clips are produced by
 * `tools/scrub-encode.swift` (single video track, no B-frames), so samples are
 * already in presentation order and sample index == frame index.
 *
 * Throws on anything it does not understand; callers fall back to <video>.
 */

export interface Mp4Sample {
  offset: number
  size: number
  key: boolean
  /** Decode/presentation time in microseconds. */
  ts: number
  /** Duration in microseconds. */
  dur: number
}

export interface Mp4VideoTrack {
  /** WebCodecs codec string, e.g. `avc1.640028`. */
  codec: string
  /** avcC box payload (the decoder `description`). */
  description: Uint8Array
  width: number
  height: number
  samples: Mp4Sample[]
  /** Indices of keyframes, ascending. */
  keyframes: number[]
  /** Frames per second (constant-rate clips). */
  fps: number
  /** Duration in seconds. */
  duration: number
}

interface Box {
  type: string
  start: number // payload start
  end: number // box end
}

export function demuxMp4(buffer: ArrayBuffer): Mp4VideoTrack {
  const dv = new DataView(buffer)
  const u8 = new Uint8Array(buffer)

  const boxes = (start: number, end: number): Box[] => {
    const out: Box[] = []
    let p = start
    while (p + 8 <= end) {
      let size = dv.getUint32(p)
      const type = String.fromCharCode(u8[p + 4]!, u8[p + 5]!, u8[p + 6]!, u8[p + 7]!)
      let header = 8
      if (size === 1) {
        size = Number(dv.getBigUint64(p + 8))
        header = 16
      } else if (size === 0) {
        size = end - p
      }
      if (size < header || p + size > end) throw new Error(`mp4: bad ${type} box`)
      out.push({ type, start: p + header, end: p + size })
      p += size
    }
    return out
  }
  const child = (parent: Box | null, type: string): Box | null => (parent ? (boxes(parent.start, parent.end).find((b) => b.type === type) ?? null) : null)
  const need = (b: Box | null, what: string): Box => {
    if (!b) throw new Error(`mp4: missing ${what}`)
    return b
  }

  const moov = need(boxes(0, buffer.byteLength).find((b) => b.type === 'moov') ?? null, 'moov')
  const trak = boxes(moov.start, moov.end)
    .filter((b) => b.type === 'trak')
    .find((t) => {
      const hdlr = child(child(t, 'mdia'), 'hdlr')
      return hdlr ? fourcc(u8, hdlr.start + 8) === 'vide' : false
    })
  const mdia = need(child(need(trak ?? null, 'video trak'), 'mdia'), 'mdia')
  const mdhd = need(child(mdia, 'mdhd'), 'mdhd')
  const timescale = dv.getUint32(mdhd.start + (u8[mdhd.start] === 1 ? 20 : 12))
  const stbl = need(child(child(mdia, 'minf'), 'stbl'), 'stbl')

  // Sample description: avc1/avc3 with an avcC child.
  const stsd = need(child(stbl, 'stsd'), 'stsd')
  const entry = boxes(stsd.start + 8, stsd.end)[0]
  if (!entry || (entry.type !== 'avc1' && entry.type !== 'avc3')) throw new Error(`mp4: unsupported codec ${entry?.type}`)
  const width = dv.getUint16(entry.start + 24)
  const height = dv.getUint16(entry.start + 26)
  const avcC = need(boxes(entry.start + 78, entry.end).find((b) => b.type === 'avcC') ?? null, 'avcC')
  const description = u8.slice(avcC.start, avcC.end)
  const codec = `avc1.${hex(description[1]!)}${hex(description[2]!)}${hex(description[3]!)}`

  // Frame reordering would break index == presentation order.
  const ctts = child(stbl, 'ctts')
  if (ctts) {
    const n = dv.getUint32(ctts.start + 4)
    let first: number | null = null
    for (let i = 0; i < n; i++) {
      const off = dv.getInt32(ctts.start + 8 + i * 8 + 4)
      if (first === null) first = off
      else if (off !== first) throw new Error('mp4: B-frames not supported')
    }
  }

  // Sizes.
  const stsz = need(child(stbl, 'stsz'), 'stsz')
  const fixed = dv.getUint32(stsz.start + 4)
  const count = dv.getUint32(stsz.start + 8)
  const sizes = new Array<number>(count)
  for (let i = 0; i < count; i++) sizes[i] = fixed || dv.getUint32(stsz.start + 12 + i * 4)

  // Timing.
  const stts = need(child(stbl, 'stts'), 'stts')
  const times: number[] = []
  const durs: number[] = []
  {
    const n = dv.getUint32(stts.start + 4)
    let t = 0
    for (let i = 0; i < n && times.length < count; i++) {
      const c = dv.getUint32(stts.start + 8 + i * 8)
      const d = dv.getUint32(stts.start + 12 + i * 8)
      for (let k = 0; k < c && times.length < count; k++) {
        times.push(Math.round((t * 1e6) / timescale))
        durs.push(Math.round((d * 1e6) / timescale))
        t += d
      }
    }
    if (times.length !== count) throw new Error('mp4: stts mismatch')
  }

  // Keyframes (no stss = every sample is a sync sample).
  const stss = child(stbl, 'stss')
  const isKey = new Array<boolean>(count).fill(!stss)
  if (stss) {
    const n = dv.getUint32(stss.start + 4)
    for (let i = 0; i < n; i++) {
      const s = dv.getUint32(stss.start + 8 + i * 4) - 1
      if (s >= 0 && s < count) isKey[s] = true
    }
  }
  if (!isKey[0]) throw new Error('mp4: first sample is not a keyframe')

  // Byte offsets from chunk offsets + sample-to-chunk runs.
  const stsc = need(child(stbl, 'stsc'), 'stsc')
  const runs: { first: number; per: number }[] = []
  {
    const n = dv.getUint32(stsc.start + 4)
    for (let i = 0; i < n; i++) runs.push({ first: dv.getUint32(stsc.start + 8 + i * 12), per: dv.getUint32(stsc.start + 12 + i * 12) })
  }
  const stco = child(stbl, 'stco')
  const co64 = child(stbl, 'co64')
  const chunkTable = need(stco ?? co64, 'stco')
  const chunks = dv.getUint32(chunkTable.start + 4)
  const chunkOffset = (c: number) => (stco ? dv.getUint32(stco.start + 8 + c * 4) : Number(dv.getBigUint64(co64!.start + 8 + c * 8)))

  const samples = new Array<Mp4Sample>(count)
  let s = 0
  let run = 0
  for (let c = 0; c < chunks && s < count; c++) {
    while (run + 1 < runs.length && runs[run + 1]!.first <= c + 1) run++
    let off = chunkOffset(c)
    const per = runs[run]?.per ?? 0
    for (let k = 0; k < per && s < count; k++, s++) {
      if (off + sizes[s]! > buffer.byteLength) throw new Error('mp4: sample out of range')
      samples[s] = { offset: off, size: sizes[s]!, key: isKey[s]!, ts: times[s]!, dur: durs[s]! }
      off += sizes[s]!
    }
  }
  if (s !== count) throw new Error('mp4: sample table mismatch')

  const keyframes: number[] = []
  for (let i = 0; i < count; i++) if (isKey[i]) keyframes.push(i)
  const last = samples[count - 1]!
  const duration = (last.ts + last.dur) / 1e6
  return { codec, description, width, height, samples, keyframes, fps: count / duration, duration }
}

function fourcc(u8: Uint8Array, p: number): string {
  return String.fromCharCode(u8[p]!, u8[p + 1]!, u8[p + 2]!, u8[p + 3]!)
}

function hex(n: number): string {
  return n.toString(16).padStart(2, '0')
}
