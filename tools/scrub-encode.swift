// GULF NEXT — scrub-friendly H.264 encoder (macOS built-in AVFoundation only).
//
// The website drives its films from the scroll position by setting
// `video.currentTime`. Every seek must decode from the nearest keyframe up to
// the requested frame, so a long GOP (avconvert's default is ~28 frames)
// makes scrubbing stutter — and reversing is far worse, because each step
// back re-decodes almost a full GOP. This encoder writes:
//   - a keyframe every `keyint` frames (default 4)
//   - no B-frames / frame reordering, so frames decode strictly in order
//   - fast-start (moov atom first), no audio track
//
// Usage: swift tools/scrub-encode.swift <src> <dst> <width> <height> <bitrate-bps> [keyint]
import AVFoundation
import Foundation

let args = CommandLine.arguments
guard args.count >= 6, let w = Int(args[3]), let h = Int(args[4]), let bitrate = Int(args[5]) else {
  FileHandle.standardError.write("usage: scrub-encode <src> <dst> <width> <height> <bitrate-bps> [keyint]\n".data(using: .utf8)!)
  exit(2)
}
let keyint = args.count > 6 ? Int(args[6]) ?? 4 : 4
let src = URL(fileURLWithPath: args[1])
let dst = URL(fileURLWithPath: args[2])
try? FileManager.default.removeItem(at: dst)

let asset = AVURLAsset(url: src)
let sem = DispatchSemaphore(value: 0)
var track: AVAssetTrack?
var fps: Float = 24
Task {
  track = try? await asset.loadTracks(withMediaType: .video).first
  if let t = track { fps = (try? await t.load(.nominalFrameRate)) ?? 24 }
  sem.signal()
}
sem.wait()
guard let videoTrack = track else { print("no video track in \(src.path)"); exit(1) }

let reader = try AVAssetReader(asset: asset)
let out = AVAssetReaderTrackOutput(track: videoTrack, outputSettings: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange,
])
out.alwaysCopiesSampleData = false
reader.add(out)

let writer = try AVAssetWriter(outputURL: dst, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true // moov first => fast start
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: w,
  AVVideoHeightKey: h,
  AVVideoScalingModeKey: AVVideoScalingModeResizeAspectFill,
  AVVideoColorPropertiesKey: [
    AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
    AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
    AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
  ],
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: bitrate,
    AVVideoMaxKeyFrameIntervalKey: keyint,
    AVVideoAllowFrameReorderingKey: false,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoH264EntropyModeKey: AVVideoH264EntropyModeCABAC,
    AVVideoExpectedSourceFrameRateKey: Int(fps.rounded()),
  ],
])
input.expectsMediaDataInRealTime = false
writer.add(input)

guard reader.startReading() else { print("reader failed: \(String(describing: reader.error))"); exit(1) }
writer.startWriting()
writer.startSession(atSourceTime: .zero)

let queue = DispatchQueue(label: "encode")
let done = DispatchSemaphore(value: 0)
input.requestMediaDataWhenReady(on: queue) {
  while input.isReadyForMoreMediaData {
    if let sample = out.copyNextSampleBuffer() {
      if !input.append(sample) {
        print("append failed: \(String(describing: writer.error))")
        reader.cancelReading()
        input.markAsFinished()
        done.signal()
        return
      }
    } else {
      input.markAsFinished()
      done.signal()
      return
    }
  }
}
done.wait()
let fin = DispatchSemaphore(value: 0)
writer.finishWriting { fin.signal() }
fin.wait()
if writer.status != .completed {
  print("write failed: \(String(describing: writer.error))")
  exit(1)
}
