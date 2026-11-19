#!/usr/bin/env bash
# 把 demo-mall 的 sql/seed 部署到本机 sdss 种子根（不进入造数插件包）。
# 默认目标：/var/lib/sdss/seed ；可用 SDSS_SEED_ROOT 覆盖。
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${SDSS_SEED_ROOT:-/var/lib/sdss/seed}"
if [[ ! -f "$SRC/scenarios/manifest.json" ]]; then
  echo "missing scenarios/manifest.json under $SRC" >&2
  exit 1
fi
mkdir -p "$DEST"
# 同步目录内容（保留相对路径）
cp -a "$SRC"/. "$DEST"/
echo "Deployed seed tree -> $DEST"
echo "Then: sdss seed.list --config ..."
