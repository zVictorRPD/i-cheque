package app.icheque;

import android.webkit.CookieManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onResume() {
        super.onResume();
        CookieManager gestor = CookieManager.getInstance();
        gestor.setAcceptCookie(true);
        if (getBridge() != null && getBridge().getWebView() != null) {
            gestor.setAcceptThirdPartyCookies(getBridge().getWebView(), true);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }
}
