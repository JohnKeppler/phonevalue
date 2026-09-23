package com.valormovil.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.valormovil.app.plugins.PhoneUsagePlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PhoneUsagePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
