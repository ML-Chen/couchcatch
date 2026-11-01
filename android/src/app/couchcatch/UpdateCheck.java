package app.couchcatch;

import android.util.Base64;

import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;

/**
 * The security check for game updates.
 *
 * Every published build comes with a small manifest (version, SHA-256 and size of index.html) and a signature over
 * that manifest, made with the project's private update key (ECDSA P-256). Only the matching PUBLIC key is compiled
 * into the app, below. So a file is installed only if it was signed with the private key, which lives in the
 * project owner's GitHub Actions secrets and never in the repository.
 *
 * That means nobody can push malware to phones by opening a pull request, pushing a branch, forking the repository,
 * or tampering with a download on the way: an unsigned or altered file fails this check and is thrown away.
 */
final class UpdateCheck {
    private UpdateCheck() { }

    /** Public half of the update-signing key (X.509 SubjectPublicKeyInfo, base64). Replacing it requires a new APK. */
    static final String UPDATE_PUBLIC_KEY_B64 =
        "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE+V2UlcHDAAWabkBjI6KOvtTcTo9GfuSqBazCvEBZ9K0whng/wFol/X84BARjK0U+mnAlkvOOtq/HbPk6xelSdw==";

    /** The game page is about 14 MB; anything far larger is refused before downloading. */
    static final long MAX_GAME_BYTES = 60L * 1024 * 1024;

    static final class Manifest {
        long version;
        String sha256;
        long size;
    }

    /** Checks the signature, then the manifest's fields. Throws if anything is wrong. */
    static Manifest verifyManifest(byte[] manifestBytes, byte[] signatureDer) throws Exception {
        PublicKey key = KeyFactory.getInstance("EC").generatePublic(
            new X509EncodedKeySpec(Base64.decode(UPDATE_PUBLIC_KEY_B64, Base64.DEFAULT)));
        Signature verifier = Signature.getInstance("SHA256withECDSA");
        verifier.initVerify(key);
        verifier.update(manifestBytes);
        if (!verifier.verify(signatureDer)) throw new SecurityException("bad update signature");

        JSONObject json = new JSONObject(new String(manifestBytes, StandardCharsets.UTF_8));
        if (!"couchcatch".equals(json.getString("app"))) throw new SecurityException("wrong app");
        if (!"index.html".equals(json.getString("file"))) throw new SecurityException("wrong file");
        Manifest manifest = new Manifest();
        manifest.version = json.getLong("version");
        manifest.sha256 = json.getString("sha256").toLowerCase();
        manifest.size = json.getLong("size");
        if (manifest.size <= 0 || manifest.size > MAX_GAME_BYTES) throw new SecurityException("bad size");
        if (!manifest.sha256.matches("[0-9a-f]{64}")) throw new SecurityException("bad hash");
        return manifest;
    }

    /** manifest.sig holds the DER signature as base64 text. */
    static byte[] decodeSignature(byte[] sigFileBytes) {
        return Base64.decode(new String(sigFileBytes, StandardCharsets.US_ASCII).trim(), Base64.DEFAULT);
    }

    static String sha256Hex(File file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream in = new FileInputStream(file)) {
            byte[] buffer = new byte[65536];
            for (int n; (n = in.read(buffer)) > 0; ) digest.update(buffer, 0, n);
        }
        StringBuilder hex = new StringBuilder();
        for (byte b : digest.digest()) hex.append(String.format("%02x", b));
        return hex.toString();
    }
}
