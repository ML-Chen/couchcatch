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
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.widget.FrameLayout;

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

    private static final int BACKGROUND = Color.parseColor("#eef3fb"); // the game's light page colour

    private WebView web;
    /** Version of the game page last served to the WebView. */
    private volatile long servedVersion = 0;

    /** Dark status-bar and navigation icons, readable on the game's light background. */
    @SuppressWarnings("deprecation")
    private void useDarkSystemBarIcons() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                int light = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                controller.setSystemBarsAppearance(light, light);
            }
        } else {
            int flags = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (Build.VERSION.SDK_INT >= 26) flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            getWindow().getDecorView().setSystemUiVisibility(flags);
            getWindow().setStatusBarColor(BACKGROUND);
            if (Build.VERSION.SDK_INT >= 26) getWindow().setNavigationBarColor(BACKGROUND);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(BACKGROUND);
        // Android 15+ draws apps edge to edge, under the status bar and the navigation buttons. The game sits in a
        // frame that is padded by exactly the space those bars (and any camera cut-out) take, so nothing is hidden.
        FrameLayout frame = new FrameLayout(this);
        frame.setBackgroundColor(BACKGROUND);
        frame.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        frame.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
            @Override public WindowInsets onApplyWindowInsets(View view, WindowInsets insets) {
                if (Build.VERSION.SDK_INT >= 30) {
                    android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                    view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                } else {
                    view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                        insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
                }
                return insets;
            }
        });
        setContentView(frame);
        useDarkSystemBarIcons();

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
                        servedVersion = GameStore.currentVersion(MainActivity.this);
                        return new WebResourceResponse("text/html", "utf-8", 200, "OK", headers,
                            GameStore.openGame(MainActivity.this));
                    } catch (Exception e) {
                        return blocked(500);
                    }
                }
                // The game found a save made by a newer build. It asks for an update by fetching these two addresses
                // (plain requests to the app's own address, so the page still gets no bridge into Android), then reloads
                // once a newer build is installed. The update itself goes through the same signature checks as always.
                if (path.equals("/update-now")) {
                    Updater.checkNow(MainActivity.this);
                    return updateStatus();
                }
                if (path.equals("/update-status")) return updateStatus();
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

    /** {"running":…, "served":…, "available":…, "result":…}: "available" above "served" means reloading gets a newer build. */
    private WebResourceResponse updateStatus() {
        long available = Math.max(servedVersion, Updater.installedVersion);
        String json = "{\"running\":" + Updater.isRunning() + ",\"served\":" + servedVersion + ",\"available\":" + available
            + ",\"result\":\"" + Updater.lastResult + "\"}";
        Map<String, String> headers = new HashMap<>();
        headers.put("Cache-Control", "no-store");
        return new WebResourceResponse("application/json", "utf-8", 200, "OK", headers,
            new ByteArrayInputStream(json.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    }

    private static WebResourceResponse blocked(int status) {
        return new WebResourceResponse("text/plain", "utf-8", status, status == 404 ? "Not Found" : "Blocked",
            new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
    }
}
