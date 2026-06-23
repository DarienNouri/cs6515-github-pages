#!/usr/bin/env bash
# Upload the 14 canonical CS6515 lecture videos used by the deployed HTML site.
#
# Defaults assume this repo sits beside:
#   ../summer-cs6515-content-by-week/
#
# Override when needed:
#   SOURCE_ROOT=/path/to/summer-cs6515-content-by-week \
#   BUCKET=darien-public-assets \
#   PREFIX=cs6515-summer-2026/v20260623/videos \
#   bash scripts/upload-videos.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_ROOT="${SOURCE_ROOT:-$(cd "$ROOT/../summer-cs6515-content-by-week" && pwd)}"
BUCKET="${BUCKET:-darien-public-assets}"
PREFIX="${PREFIX:-cs6515-summer-2026/v20260623/videos}"
CACHE_CONTROL="${CACHE_CONTROL:-public, max-age=31536000, immutable}"

command -v gcloud >/dev/null || { echo "gcloud is required"; exit 1; }

VIDEO_DIR="$SOURCE_ROOT/CS6515_Lectures_by_course_order"
[ -d "$VIDEO_DIR" ] || { echo "missing video directory: $VIDEO_DIR"; exit 1; }

count="$(find -L "$VIDEO_DIR" -maxdepth 1 -type f -name '*.mp4' | wc -l | tr -d ' ')"
[ "$count" = "14" ] || { echo "expected 14 videos in $VIDEO_DIR, found $count"; exit 1; }

echo "source: $VIDEO_DIR"
echo "target: gs://$BUCKET/$PREFIX/"
echo "videos: $count"

find -L "$VIDEO_DIR" -maxdepth 1 -type f -name '*.mp4' -print | sort | while IFS= read -r src; do
  name="$(basename "$src")"
  dst="gs://$BUCKET/$PREFIX/$name"
  echo "==> $name"
  gcloud storage cp \
    --no-clobber \
    --content-type="video/mp4" \
    --cache-control="$CACHE_CONTROL" \
    "$src" "$dst"
done

echo "==> verifying uploaded objects"
uploaded="$(gcloud storage objects list "gs://$BUCKET/$PREFIX/**" --uri | grep -c '\.mp4' || true)"
if [ "$uploaded" != "14" ]; then
  echo "expected 14 uploaded mp4 objects, found $uploaded"
  exit 1
fi

first_url="https://storage.googleapis.com/$BUCKET/$PREFIX/01_Week_01_Intro_DP.mp4"
echo "first video URL: $first_url"
curl -fsSI -r 0-0 "$first_url" | sed -n '1,12p'
echo "done"

