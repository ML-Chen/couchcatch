package app.couchcatch;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import javax.net.ssl.HttpsURLConnection;

/**
 * Downloads newer game builds in the background.
 *
 * It only ever looks at the `gh-pages` branch of the ML-Chen/couchcatch repository (fixed below, HTTPS only),
 * and it only installs a build whose manifest is signed with the project's update key (see UpdateCheck).
 * Steps: fetch manifest.json and manifest.sig, verify the signature, and skip unless the version is newer than
 * what is installed. Then download index.html to a temporary file, check its size and SHA-256 against the
 * signed manifest, and only then move it into place. The new build loads the next time the app starts, or right away
 * when the game asks for it (a save made by a newer build: see MainActivity's /update-now and /update-status).
 */
final class Updater {
    private Updater() { }

    /** Where published builds live. Both are the same files; the second is a fallback. */
    static final String[] SOURCES = {
        "https://raw.githubusercontent.com/ML-Chen/couchcatch/gh-pages/",
        "https://ml-chen.github.io/couchcatch/",
    };

    static final long MIN_CHECK_INTERVAL_MS = 3L * 60 * 60 * 1000; // at most every 3 hours
    private static volatile boolean running = false;
    /** How the last check ended: "" (none yet), "installed", "latest" (nothing newer published) or "failed". */
    static volatile String lastResult = "";
    /** Version of the build the last check installed (0 if none), so status questions don't re-hash the game file. */
    static volatile long installedVersion = 0;

    static boolean isRunning() { return running; }

    /** The regular check at launch and resume, at most every few hours. */
    static void checkInBackground(final Activity activity) {
        start(activity, false);
    }

    /** A check right now, skipping the wait between checks: the game found a save it can't read yet. */
    static void checkNow(final Activity activity) {
        start(activity, true);
    }

    private static synchronized void start(final Activity activity, final boolean asked) {
        final Context context = activity.getApplicationContext();
        SharedPreferences prefs = context.getSharedPreferences("updater", Context.MODE_PRIVATE);
        long now = System.currentTimeMillis();
        if (running || (!asked && now - prefs.getLong("lastCheck", 0) < MIN_CHECK_INTERVAL_MS)) return;
        running = true;
        prefs.edit().putLong("lastCheck", now).apply();
        new Thread(new Runnable() {
            @Override public void run() {
                String result = "failed";
                try {
                    boolean installed = checkOnce(context);
                    result = installed ? "installed" : "latest";
                    if (installed && !asked) { // when the game asked, it reloads into the new build itself
                        activity.runOnUiThread(new Runnable() {
                            @Override public void run() {
                                Toast.makeText(context, "新版本准备好了 · New version ready next time", Toast.LENGTH_LONG).show();
                            }
                        });
                    }
                } catch (Exception ignored) {
                    // Offline or a bad download: keep playing the installed build and try again later.
                } finally {
                    lastResult = result;
                    running = false;
                }
            }
        }, "couchcatch-updater").start();
    }

    /** Returns true if a newer, verified build was installed, false if nothing newer is published; throws if no source answered. */
    static boolean checkOnce(Context context) throws Exception {
        Exception lastError = null;
        for (String base : SOURCES) {
            try {
                byte[] manifestBytes = fetch(base + "update/manifest.json", 64 * 1024);
                byte[] signature = UpdateCheck.decodeSignature(fetch(base + "update/manifest.sig", 4 * 1024));
                UpdateCheck.Manifest manifest = UpdateCheck.verifyManifest(manifestBytes, signature);
                if (manifest.version <= GameStore.currentVersion(context)) return false; // nothing newer

                File dir = GameStore.updateDir(context);
                if (!dir.exists() && !dir.mkdirs()) throw new IllegalStateException("no storage");
                File partial = new File(dir, "index.html.partial");
                download(base + "update/index.html", partial, manifest.size);
                if (partial.length() != manifest.size || !manifest.sha256.equals(UpdateCheck.sha256Hex(partial))) {
                    partial.delete();
                    throw new SecurityException("download does not match the signed manifest");
                }
                // Install: game file first, then the manifest and signature that vouch for it.
                writeFile(new File(dir, "manifest.json.partial"), manifestBytes);
                writeFile(new File(dir, "manifest.sig.partial"),
                    android.util.Base64.encodeToString(signature, android.util.Base64.NO_WRAP).getBytes("US-ASCII"));
                if (!partial.renameTo(GameStore.updateFile(context))
                    || !new File(dir, "manifest.json.partial").renameTo(GameStore.updateManifest(context))
                    || !new File(dir, "manifest.sig.partial").renameTo(GameStore.updateSignature(context))) {
                    throw new IllegalStateException("could not install update");
                }
                boolean ok = GameStore.verifiedUpdateVersion(context) == manifest.version;
                if (ok) installedVersion = manifest.version;
                return ok;
            } catch (SecurityException e) {
                throw e; // a bad signature or hash is never retried from another source
            } catch (Exception e) {
                lastError = e; // network trouble with this source: try the next one
            }
        }
        throw lastError != null ? lastError : new IllegalStateException("no update source");
    }

    private static HttpsURLConnection open(String url) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        if (!(connection instanceof HttpsURLConnection)) throw new SecurityException("not HTTPS");
        connection.setConnectTimeout(15000);
        connection.setReadTimeout(30000);
        connection.setInstanceFollowRedirects(true); // HttpURLConnection never follows an HTTPS->HTTP redirect
        connection.setRequestProperty("Cache-Control", "no-cache");
        if (connection.getResponseCode() != 200) throw new IllegalStateException("HTTP " + connection.getResponseCode());
        return (HttpsURLConnection) connection;
    }

    private static byte[] fetch(String url, int maxBytes) throws Exception {
        HttpsURLConnection connection = open(url);
        try (InputStream in = connection.getInputStream()) {
            byte[] data = GameStore.readAll(in);
            if (data.length > maxBytes) throw new SecurityException("response too large");
            return data;
        } finally {
            connection.disconnect();
        }
    }

    private static void download(String url, File target, long expectedSize) throws Exception {
        HttpsURLConnection connection = open(url);
        long written = 0;
        try (InputStream in = connection.getInputStream(); OutputStream out = new FileOutputStream(target)) {
            byte[] buffer = new byte[65536];
            for (int n; (n = in.read(buffer)) > 0; ) {
                written += n;
                if (written > expectedSize) throw new SecurityException("download larger than signed size");
                out.write(buffer, 0, n);
            }
        } finally {
            connection.disconnect();
        }
    }

    private static void writeFile(File file, byte[] data) throws Exception {
        try (OutputStream out = new FileOutputStream(file)) { out.write(data); }
    }
}
