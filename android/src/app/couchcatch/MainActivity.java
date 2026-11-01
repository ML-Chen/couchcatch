package app.couchcatch;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Shows the game in a WebView.
 *
 * The page is served from a made-up HTTPS address, https://appassets.androidplatform.net/index.html
 * (the host Android reserves for exactly this). Requests to it never reach the network: this class
 * answers them from the installed game file. Using one fixed address matters because the game's save
 * lives in the page's localStorage, which belongs to the page's address. Whether the bundled build or
 * a downloaded update is served, the address and therefore the save stay the same.
 */
public class MainActivity extends Activity {
    static final String APP_HOST = "appassets.androidplatform.net";
    static final String GAME_URL = "https://" + APP_HOST + "/index.html";

    /** The only outside hosts the page may load from: the web font and Chinese stroke data the game asks for. */
    static final String[] ALLOWED_OUTSIDE_HOSTS = {
        "fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net"
    };

    /** Limits what the page itself can load or run, as a second line of defence behind the update signature. */
    static final String CONTENT_SECURITY_POLICY =
        "default-src 'self' data: blob:; "
        + "script-src 'self' 'unsafe-inline' blob:; "
        + "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        + "font-src 'self' data: https://fonts.gstatic.com; "
        + "img-src 'self' data: blob:; media-src 'self' data: blob:; "
        + "connect-src 'self' data: blob: https://cdn.jsdelivr.net; "
        + "frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";

    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#eef3fb"));
        setContentView(web);

        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);          // the game is JavaScript
        settings.setDomStorageEnabled(true);          // localStorage holds the saves
        settings.setMediaPlaybackRequiresUserGesture(false); // spoken Chinese can start right after a tap
        settings.setAllowFileAccess(false);           // the page cannot read files on the phone
        settings.setAllowContentAccess(false);
        settings.setGeolocationEnabled(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setTextZoom(100);                    // the layout is designed for exact sizes
        if (Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);
        // No addJavascriptInterface: the page gets no bridge into Android at all.

        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new GameClient());
        web.loadUrl(GAME_URL);

        Updater.checkInBackground(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
        Updater.checkInBackground(this); // at most every few hours; see Updater.MIN_CHECK_INTERVAL_MS
    }

    @Override
    protected void onPause() {
        if (web != null) web.onPause(); // the game saves itself when the page is hidden
        super.onPause();
    }

    @Override
    public void onBackPressed() {
        moveTaskToBack(true); // keep the game running in the background instead of closing it
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }

    private class GameClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            String host = url.getHost() == null ? "" : url.getHost();
            if (APP_HOST.equals(host)) {
                String path = url.getPath() == null ? "/" : url.getPath();
                if (path.equals("/") || path.equals("/index.html")) {
                    try {
                        Map<String, String> headers = new HashMap<>();
                        headers.put("Content-Security-Policy", CONTENT_SECURITY_POLICY);
                        headers.put("Cache-Control", "no-store");
                        return new WebResourceResponse("text/html", "utf-8", 200, "OK", headers,
                            GameStore.openGame(MainActivity.this));
                    } catch (Exception e) {
                        return blocked(500);
                    }
                }
                return blocked(404);
            }
            if ("https".equals(url.getScheme())) {
                for (String allowed : ALLOWED_OUTSIDE_HOSTS) {
                    if (allowed.equals(host)) return null; // let the WebView fetch it normally
                }
            }
            if ("data".equals(url.getScheme()) || "blob".equals(url.getScheme())) return null;
            return blocked(403); // everything else is refused
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if (APP_HOST.equals(url.getHost())) return false;
            // Links to anywhere else open in the phone's browser, never inside the game window.
            if ("https".equals(url.getScheme())) {
                try { startActivity(new Intent(Intent.ACTION_VIEW, url)); } catch (Exception ignored) { }
            }
            return true;
        }
    }

    private static WebResourceResponse blocked(int status) {
        return new WebResourceResponse("text/plain", "utf-8", status, status == 404 ? "Not Found" : "Blocked",
            new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
    }
}
