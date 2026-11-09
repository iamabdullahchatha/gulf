#!/bin/zsh
# GULF NEXT — media build pipeline (macOS built-ins only: AVFoundation via swiftc, avconvert, qlmanage, sips).
# Turns the raw scene renders in the project root into web-ready assets:
#   assets/media/video/1080/<id>.mp4   desktop  (H.264, fast-start, 8-frame GOP)
#   assets/media/video/720/<id>.mp4    mobile   (H.264, fast-start, 8-frame GOP)
#   assets/media/video/540/<id>.mp4    preview  (~1.6 MB, loads first so footage moves at once)
#   assets/media/posters/<id>.jpg      1920px first frame (poster + fallback)
#   assets/media/posters/<id>-sm.jpg   960px first frame (mobile poster)
# The original renders are never modified.
# Usage:  zsh tools/build-media.sh            # build everything missing
#         zsh tools/build-media.sh --force    # rebuild everything
set -euo pipefail
cd "${0:A:h}/.."

FORCE=${1:-}
OUT=assets/media
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# Compile the scrub-friendly encoder once (Swift ships with the Xcode Command Line Tools).
ENC="$TMP/scrub-encode"
swiftc -O tools/scrub-encode.swift -o "$ENC" 2>/dev/null

# id | original file (exact filename on disk)
MANIFEST=(
  "scene-01-homepage-opening|Scene 01 — Homepage opening.mp4"
  "scene-02-oil-extraction|Scene 02 — Oil extraction.mp4"
  "scene-03-offshore-extraction|Scene 03 — Offshore extraction.mp4"
  "scene-04-onshore|scene-4-oonshore.mp4"
  "scene-05-mechanical-engineering|Scene 05 — Mechanical engineering.mp4"
  "scene-09-about-us|Scene 09  About Us.mp4"
  "scene-10-about-us|Scene 10 — About Us.mp4"
  "scene-11-services|Scene 11 — Services.mp4"
  "scene-12-industries|Scene 12 — Industries.mp4"
  "refinery-operations|refinery operation.mp4"
)

for row in "${MANIFEST[@]}"; do
  id=${row%%|*}; src=${row#*|}
  if [[ ! -f "$src" ]]; then echo "skip  $id  (missing: $src)"; continue; fi
  for res in 1080 720 540; do
    dst="$OUT/video/$res/$id.mp4"
    if [[ -n "$FORCE" || ! -f "$dst" ]]; then
      # Scroll-scrubbed footage: keyframe every 8 frames, no B-frames (see tools/scrub-encode.swift).
      # Quality measured against the master renders (luma PSNR): 1080p 40.4 dB,
      # 720p 39.8 dB — on par with the original long-GOP encode — at 8-frame GOP.
      case $res in
        1080) "$ENC" "$src" "$dst" 1920 1080 13000000 8 ;;
        720)  "$ENC" "$src" "$dst" 1280 720 8000000 8 ;;
        540)  "$ENC" "$src" "$dst" 960 540 1600000 8 ;;  # preview tier: loads first so footage moves at once
      esac
      echo "video $dst"
    fi
  done
  if [[ -n "$FORCE" || ! -f "$OUT/posters/$id.jpg" ]]; then
    # Cut the first 0.1s, thumbnail it => poster equals the video's first frame,
    # so the poster-to-video crossfade is seamless.
    avconvert -s "$src" -p Preset1920x1080 -o "$TMP/$id.mp4" --duration 0.1 --replace >/dev/null
    qlmanage -t -s 1920 -o "$TMP" "$TMP/$id.mp4" >/dev/null 2>&1
    sips -s format jpeg -s formatOptions 72 "$TMP/$id.mp4.png" --out "$OUT/posters/$id.jpg" >/dev/null
    sips -s format jpeg -s formatOptions 68 -Z 960 "$TMP/$id.mp4.png" --out "$OUT/posters/$id-sm.jpg" >/dev/null
    echo "poster $OUT/posters/$id.jpg"
  fi
done
