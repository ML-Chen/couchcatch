#!/usr/bin/env bash
# Builds the Couchcatch Android app (an APK) from the current game build, without Gradle.
#
#   android/build.sh [game.html] [out.apk]
#
# Needs: a JDK (javac, keytool), and the official Android SDK build-tools 35 + platform 35.
#   ANDROID_BUILD_TOOLS  folder with aapt2, d8, zipalign, apksigner (default: $ANDROID_HOME/build-tools/35.0.1)
#   ANDROID_PLATFORM     folder with android.jar                     (default: $ANDROID_HOME/platforms/android-35)
# Signing (the same key must sign every future version, or Android refuses to install it over the old one):
#   ANDROID_KEYSTORE, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS (default couchcatch)
# The game file goes inside the APK, so the app works offline. Its version number is the source commit time,
# the same number the signed web updates use, so the app knows whether a downloaded update is newer.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
GAME="${1:-$ROOT/dist/couchcatch.html}"
OUT="${2:-$ROOT/dist/couchcatch.apk}"
BT="${ANDROID_BUILD_TOOLS:-${ANDROID_HOME:-}/build-tools/35.0.1}"
PLATFORM="${ANDROID_PLATFORM:-${ANDROID_HOME:-}/platforms/android-35}"
ANDROID_JAR="$PLATFORM/android.jar"
ALIAS="${ANDROID_KEY_ALIAS:-couchcatch}"
for f in "$BT/aapt2" "$BT/d8" "$BT/zipalign" "$BT/apksigner" "$ANDROID_JAR" "$GAME"; do
  [ -e "$f" ] || { echo "missing: $f" >&2; exit 1; }
done
: "${ANDROID_KEYSTORE:?set ANDROID_KEYSTORE to the release keystore}"
: "${ANDROID_KEYSTORE_PASSWORD:?set ANDROID_KEYSTORE_PASSWORD}"

WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
VERSION="$(git -C "$ROOT" log -1 --format=%ct -- src 2>/dev/null || date +%s)"
# The app's own version (for Android's "is this an update?" check) also moves when only the Android code changes.
APP_VERSION="$(git -C "$ROOT" log -1 --format=%ct -- src android 2>/dev/null || date +%s)"

# 1. The game, as an asset, with a small manifest giving its version and hash.
mkdir -p "$WORK/assets/game"
cp "$GAME" "$WORK/assets/game/index.html"
python3 "$ROOT/tools/update_manifest.py" "$WORK/assets/game/index.html" --version "$VERSION" > "$WORK/assets/game/manifest.json"

# 2. Resources (the launcher icon) and the manifest, compiled with aapt2.
"$BT/aapt2" compile --dir "$HERE/res" -o "$WORK/res.zip"
"$BT/aapt2" link -o "$WORK/unsigned.apk" -I "$ANDROID_JAR" --manifest "$HERE/AndroidManifest.xml" \
  --version-code "$(( (APP_VERSION - 1700000000) / 60 ))" --version-name "$(date -u -d "@$APP_VERSION" +%Y.%m.%d.%H%M)" \
  -A "$WORK/assets" "$WORK/res.zip" --auto-add-overlay

# 3. Java -> class files -> Android bytecode (classes.dex).
mkdir -p "$WORK/classes"
javac -nowarn --release 11 -classpath "$ANDROID_JAR" -d "$WORK/classes" $(find "$HERE/src" -name '*.java')
"$BT/d8" --release --min-api 24 --lib "$ANDROID_JAR" --output "$WORK" $(find "$WORK/classes" -name '*.class')
(cd "$WORK" && zip -q -j unsigned.apk classes.dex)

# 4. Align and sign.
"$BT/zipalign" -f -p 4 "$WORK/unsigned.apk" "$WORK/aligned.apk"
"$BT/apksigner" sign --ks "$ANDROID_KEYSTORE" --ks-key-alias "$ALIAS" \
  --ks-pass env:ANDROID_KEYSTORE_PASSWORD --key-pass env:ANDROID_KEYSTORE_PASSWORD \
  --out "$OUT" "$WORK/aligned.apk"
"$BT/apksigner" verify --print-certs "$OUT" | head -3
echo "built $OUT ($(du -h "$OUT" | cut -f1)), game version $VERSION"
