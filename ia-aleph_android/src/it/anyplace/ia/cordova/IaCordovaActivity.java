package it.anyplace.ia.cordova;

import org.apache.cordova.*;
import android.app.Activity;
import android.os.Bundle;

public class IaCordovaActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("splashscreen", R.drawable.splash);
        super.loadUrl("file:///android_asset/www/ia.html",30000);
    }
}