#!/usr/bin/env bash
# Regenerates public/og.png and public/apple-touch-icon.png from scripts/og.html.
# Needs the dev server on :5173 (npm run dev) and Microsoft Edge (or set BROWSER).
set -euo pipefail
BROWSER="${BROWSER:-/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe}"
"$BROWSER" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=5000 \
  --window-size=1200,630 --screenshot="$PWD/public/og.png" "http://localhost:5173/scripts/og.html"
"$BROWSER" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=5000 \
  --window-size=180,180 --screenshot="$PWD/public/apple-touch-icon.png" "http://localhost:5173/scripts/og.html?icon"
echo "wrote public/og.png and public/apple-touch-icon.png"
