#!/usr/bin/env bash
# Assembles the GitHub Pages site for a game build, including the SIGNED update the Android app downloads.
#
#   tools/publish_pages.sh dist/couchcatch.html OUTDIR
#
# OUTDIR gets: index.html (the game), .nojekyll, update/index.html (same game), update/manifest.json
# (version, size, SHA-256) and update/manifest.sig (ECDSA P-256 signature over manifest.json, base64 DER).
#
# The signing key comes from the COUCHCATCH_UPDATE_KEY environment variable (a PEM private key). In GitHub it is
# an Actions secret, so only this repository's own workflow on the main branch can sign. Forks and pull requests
# never see it. Without the key, the update folder is left out, and phones keep the build they already have.
set -euo pipefail
GAME="$1"; OUT="$2"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(git -C "$ROOT" log -1 --format=%ct -- src)"
mkdir -p "$OUT"
cp "$GAME" "$OUT/index.html"
touch "$OUT/.nojekyll"
if [ -n "${COUCHCATCH_UPDATE_KEY:-}" ]; then
  mkdir -p "$OUT/update"
  cp "$GAME" "$OUT/update/index.html"
  python3 "$ROOT/tools/update_manifest.py" "$GAME" --version "$VERSION" > "$OUT/update/manifest.json"
  KEYFILE="$(mktemp)"; trap 'rm -f "$KEYFILE"' EXIT
  printf '%s\n' "$COUCHCATCH_UPDATE_KEY" > "$KEYFILE"
  openssl dgst -sha256 -sign "$KEYFILE" "$OUT/update/manifest.json" | base64 -w0 > "$OUT/update/manifest.sig"
  # Check the signature against the public key the app has compiled in, so a wrong secret fails loudly here.
  base64 -d "$ROOT/android/update_signing_key.pub.b64" > "$KEYFILE.pub.der"
  openssl pkey -pubin -inform DER -in "$KEYFILE.pub.der" -out "$KEYFILE.pub.pem"
  base64 -d "$OUT/update/manifest.sig" > "$KEYFILE.sig"
  openssl dgst -sha256 -verify "$KEYFILE.pub.pem" -signature "$KEYFILE.sig" "$OUT/update/manifest.json"
  rm -f "$KEYFILE.pub.der" "$KEYFILE.pub.pem" "$KEYFILE.sig"
  echo "signed update version $VERSION"
else
  # No key here: keep the last signed update exactly as it was, so phones keep seeing a valid (older) build
  # instead of nothing. Nothing new can be signed without the key.
  if git -C "$ROOT" rev-parse -q --verify origin/gh-pages >/dev/null; then
    mkdir -p "$OUT/update"
    for f in index.html manifest.json manifest.sig; do
      git -C "$ROOT" show "origin/gh-pages:update/$f" > "$OUT/update/$f" 2>/dev/null || { rm -rf "$OUT/update"; break; }
    done
  fi
  echo "COUCHCATCH_UPDATE_KEY not set: published the web game; the app update stays at the last signed build" >&2
fi
# The Android app itself, for direct download from the Pages site.
APK="${COUCHCATCH_APK:-$ROOT/android/release/couchcatch.apk}"  # the newest released APK, when the workflow fetched one
if [ -f "$APK" ]; then cp "$APK" "$OUT/couchcatch.apk"; fi
