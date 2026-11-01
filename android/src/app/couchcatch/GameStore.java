package app.couchcatch;

import android.content.Context;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Where the game file comes from.
 *
 * Two copies can exist:
 *  - the bundled build inside the APK: assets/game/index.html, with assets/game/manifest.json giving its version;
 *  - a downloaded update in the app's private storage: files/game/index.html, plus the signed manifest it came with.
 * The newer valid copy wins. A downloaded copy is re-checked (signature and SHA-256) every launch, so a damaged or
 * tampered file is ignored and the bundled build is used instead.
 */
final class GameStore {
    private GameStore() { }

    static final String BUNDLED_DIR = "game";

    static File updateDir(Context context) { return new File(context.getFilesDir(), "game"); }
    static File updateFile(Context context) { return new File(updateDir(context), "index.html"); }
    static File updateManifest(Context context) { return new File(updateDir(context), "manifest.json"); }
    static File updateSignature(Context context) { return new File(updateDir(context), "manifest.sig"); }

    /** Version number of the build inside the APK (the source commit time, in seconds). */
    static long bundledVersion(Context context) {
        try (InputStream in = context.getAssets().open(BUNDLED_DIR + "/manifest.json")) {
            return new JSONObject(new String(readAll(in), StandardCharsets.UTF_8)).getLong("version");
        } catch (Exception e) {
            return 0;
        }
    }

    /** Version of the downloaded update if it is present and still verifies; 0 otherwise. */
    static long verifiedUpdateVersion(Context context) {
        try {
            byte[] manifestBytes = readFile(updateManifest(context));
            byte[] signature = UpdateCheck.decodeSignature(readFile(updateSignature(context)));
            UpdateCheck.Manifest manifest = UpdateCheck.verifyManifest(manifestBytes, signature);
            File game = updateFile(context);
            if (game.length() != manifest.size) return 0;
            if (!manifest.sha256.equals(UpdateCheck.sha256Hex(game))) return 0;
            return manifest.version;
        } catch (Exception e) {
            return 0;
        }
    }

    /** The version the player is (or will be after a restart) running. */
    static long currentVersion(Context context) {
        return Math.max(bundledVersion(context), verifiedUpdateVersion(context));
    }

    /** Opens the game page to serve: the verified update if it is newer than the bundled build, else the bundled build. */
    static InputStream openGame(Context context) throws IOException {
        if (verifiedUpdateVersion(context) > bundledVersion(context)) {
            return new FileInputStream(updateFile(context));
        }
        return context.getAssets().open(BUNDLED_DIR + "/index.html");
    }

    static byte[] readFile(File file) throws IOException {
        try (InputStream in = new FileInputStream(file)) { return readAll(in); }
    }

    static byte[] readAll(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[16384];
        for (int n; (n = in.read(buffer)) > 0; ) out.write(buffer, 0, n);
        return out.toByteArray();
    }
}
