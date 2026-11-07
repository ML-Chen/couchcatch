# Couchcatch for Android

A small Android app around the same single-file game. It works offline, and it updates itself from GitHub, but only with builds signed by the project's update key.

## Install

Download `couchcatch.apk` from https://ml-chen.github.io/couchcatch/couchcatch.apk (it is the APK attached to the newest `android-v*` GitHub Release) and open it on the phone. Android asks once to allow installs from the browser or files app. Saves stay on the phone inside the app, and survive updates of the game. They are deleted only when the app is uninstalled or its storage is cleared. Settings → Save code moves a save between devices.

## How updates work, and why they are safe

1. The APK contains a full copy of the game, so it plays with no connection from the first launch.
2. When it's online (at most every 3 hours), the app downloads `update/manifest.json` and `update/manifest.sig` from the `gh-pages` branch of ML-Chen/couchcatch. The manifest names the game file, its version, size and SHA-256.
3. The app checks the signature (ECDSA P-256) against the public key compiled into the APK (`UpdateCheck.java`; the same key is in `update_signing_key.pub.b64`). It skips the update unless the signature is valid and the version is newer than what's installed.
4. Only then does it download `update/index.html`, and installs it only if its size and SHA-256 match the signed manifest. The new build loads the next time the app starts.

The private key that makes those signatures is stored only as the GitHub Actions secret `COUCHCATCH_UPDATE_KEY`. The workflow `.github/workflows/publish.yml` uses it to sign each push to `main`. GitHub never gives secrets to workflows from forks or pull requests, and branches other than `main` don't trigger the workflow. So pushing a branch, opening a pull request, forking the repository, or tampering with a download cannot get code onto a phone: the signature check fails and the app keeps what it has.

The app itself is locked down too:
- The game page has no bridge into Android.
- It can't read phone files.
- A Content-Security-Policy limits what it can load.
- Every outside address is blocked except the web font and Chinese stroke-data hosts.
- Links open in the phone's browser.

## Build

```
export ANDROID_BUILD_TOOLS=<sdk>/build-tools/35.0.1 ANDROID_PLATFORM=<sdk>/platforms/android-35
export ANDROID_KEYSTORE=<release keystore> ANDROID_KEYSTORE_PASSWORD=<password>
android/build.sh dist/couchcatch.html dist/couchcatch.apk
```

No Gradle: aapt2 → javac → d8 → zipalign → apksigner. Every future APK must be signed with the same release keystore, or Android refuses to install it over the old one. Keep the keystore and its password safe, and outside the repository. Game updates don't need a new APK; only changes to the Android code do.

### Releasing a new app version from GitHub

GitHub builds and signs the app itself. Once the two secrets below are added (Settings → Secrets and variables → Actions), publish a release whose tag starts with `android-v` (for example `android-v1.2`). The **Release Android APK** workflow builds the game and the APK, signs it, checks the signing certificate is the project's (SHA-256 `CF:9A:2F:61:…:37:60:E6`), attaches `couchcatch.apk` to the release and republishes the Pages site so the download link serves it. Running the workflow by hand (Actions → Release Android APK → Run workflow) builds a signed APK as a downloadable artifact without making a release.

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_B64` | the release keystore as one line of base64 (`base64 -w0 android_release.keystore`) |
| `ANDROID_KEYSTORE_PASSWORD` | the keystore password (the key inside uses the same one; the alias is `couchcatch`) |

Tests:
- `node tools/test_app_csp.js dist/couchcatch.html` runs the game under the app's exact security policy.
- The update check was tested on a desktop JVM against genuine, tampered, re-versioned and foreign-signed manifests.
