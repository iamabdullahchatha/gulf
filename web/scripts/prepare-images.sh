#!/bin/zsh
# Prepares your photos for the service and industry cards (macOS built-in `sips`).
#
# 1. Put photos in web/photos-incoming/, named after the card they belong to:
#      services:   field-services  wellsite-drilling  pipelines  mechanical  industrial-construction
#                  steel-structures  electromechanical  maintenance  equipment-supply
#      industries: oil-gas  petrochemical  construction  mechanical-equipment
#                  (card photo) — add -inner for the inner-page photo, e.g. pipelines-inner.jpg
#      sections:   why (Why GULF NEXT photo)   contact (Start a conversation background)
#    Any of .jpg .jpeg .png .webp .heic — e.g. photos-incoming/offshore.jpg
# 2. Run:  zsh scripts/prepare-images.sh
#
# Each photo becomes a 1600px and an 800px JPEG in public/assets/images/…,
# replacing the placeholder. Originals in photos-incoming/ are not changed.
set -euo pipefail
cd "${0:A:h}/.."
IN=photos-incoming
OUT=public/assets/images
SERVICES=(field-services wellsite-drilling pipelines mechanical industrial-construction steel-structures electromechanical maintenance equipment-supply)
INDUSTRIES=(oil-gas petrochemical construction mechanical-equipment)
SECTIONS=(why contact)
count=0
for f in $IN/*(N.); do
  name=${${f:t}:r:l}
  base=${name%-inner}
  if (( ${SERVICES[(Ie)$base]} )); then dir=services
  elif (( ${INDUSTRIES[(Ie)$base]} )); then dir=industries
  elif (( ${SECTIONS[(Ie)$name]} )); then dir=sections
  else echo "skip  ${f:t}  (name not recognised)"; continue; fi
  mkdir -p $OUT/$dir
  sips -s format jpeg -s formatOptions 84 --resampleWidth 1600 "$f" --out "$OUT/$dir/$name.jpg" >/dev/null
  sips -s format jpeg -s formatOptions 80 --resampleWidth 800 "$f" --out "$OUT/$dir/$name-sm.jpg" >/dev/null
  echo "ok    $dir/$name.jpg"
  count=$((count + 1))
done
echo "$count photo(s) prepared."
