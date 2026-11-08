#!/bin/zsh
# GULF NEXT — media build pipeline (macOS built-ins only: avconvert, qlmanage, sips).
# Turns the raw scene renders in the project root into web-ready assets:
#   assets/media/video/1080/<id>.mp4   desktop  (H.264, fast-start)
#   assets/media/video/720/<id>.mp4    mobile   (H.264, fast-start)
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
  for res in 1080 720; do
    dst="$OUT/video/$res/$id.mp4"
    if [[ -n "$FORCE" || ! -f "$dst" ]]; then
      preset=Preset1920x1080; [[ $res == 720 ]] && preset=Preset1280x720
      avconvert -s "$src" -p $preset -o "$dst" --replace >/dev/null
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
