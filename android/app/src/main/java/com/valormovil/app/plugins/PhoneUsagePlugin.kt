package com.valormovil.app.plugins

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.BatteryManager
import android.os.Build
import android.os.Environment
import android.os.Process
import android.os.StatFs
import android.provider.Settings
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Local Capacitor plugin: UsageStats + storage + basic device signals.
 * All data stays on-device; nothing is uploaded.
 */
@CapacitorPlugin(name = "PhoneUsage")
class PhoneUsagePlugin : Plugin() {

    @PluginMethod
    fun isUsageAccessGranted(call: PluginCall) {
        val granted = hasUsageAccess()
        val ret = JSObject()
        ret.put("granted", granted)
        call.resolve(ret)
    }

    @PluginMethod
    fun openUsageAccessSettings(call: PluginCall) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            activity.startActivity(intent)
            call.resolve()
        } catch (e: Exception) {
            call.reject("No se pudo abrir Ajustes de acceso al uso: ${e.message}", e)
        }
    }

    /**
     * Returns aggregated foreground time by package for the requested window,
     * plus earliest/latest coverage so the UI can show "X días de historial".
     *
     * options:
     *  - rangeDays: number (default 7) — look-back window
     */
    @PluginMethod
    fun getUsageSummary(call: PluginCall) {
        if (!hasUsageAccess()) {
            call.reject("USAGE_ACCESS_DENIED", "Falta el permiso de acceso al uso (Usage Access).")
            return
        }

        val rangeDays = call.getInt("rangeDays") ?: 30
        val end = System.currentTimeMillis()
        val begin = end - rangeDays.toLong() * 24L * 60L * 60L * 1000L

        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val aggregated: Map<String, UsageStats> =
            usm.queryAndAggregateUsageStats(begin, end) ?: emptyMap()

        // Also query INTERVAL_DAILY for better coverage bounds when available
        val daily = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, begin, end)
            ?: emptyList()

        var earliest = Long.MAX_VALUE
        var latest = 0L
        var totalForeground = 0L

        val packages = JSArray()
        for ((pkg, stats) in aggregated) {
            val ms = stats.totalTimeInForeground
            if (ms <= 0L) continue
            totalForeground += ms

            val first = stats.firstTimeStamp
            val last = stats.lastTimeStamp
            if (first in 1 until earliest) earliest = first
            if (last > latest) latest = last

            val row = JSObject()
            row.put("packageName", pkg)
            row.put("totalTimeInForegroundMs", ms)
            row.put("lastTimeUsed", stats.lastTimeUsed)
            packages.put(row)
        }

        // Refine coverage from daily buckets
        for (s in daily) {
            if (s.totalTimeInForeground <= 0L) continue
            if (s.firstTimeStamp in 1 until earliest) earliest = s.firstTimeStamp
            if (s.lastTimeStamp > latest) latest = s.lastTimeStamp
        }

        if (earliest == Long.MAX_VALUE) earliest = begin
        if (latest == 0L) latest = end

        val coverageMs = (latest - earliest).coerceAtLeast(0L)
        val historyDays = (coverageMs / (24.0 * 60 * 60 * 1000)).coerceAtLeast(0.0)

        val ret = JSObject()
        ret.put("beginTime", begin)
        ret.put("endTime", end)
        ret.put("rangeDaysRequested", rangeDays)
        ret.put("earliestTimestamp", earliest)
        ret.put("latestTimestamp", latest)
        ret.put("historyDays", historyDays)
        ret.put("totalForegroundMs", totalForeground)
        ret.put("packages", packages)
        call.resolve(ret)
    }

    @PluginMethod
    fun getStorageInfo(call: PluginCall) {
        try {
            val path = Environment.getDataDirectory()
            val stat = StatFs(path.path)
            val blockSize = stat.blockSizeLong
            val total = stat.blockCountLong * blockSize
            val free = stat.availableBlocksLong * blockSize
            val used = total - free
            val ret = JSObject()
            ret.put("totalBytes", total)
            ret.put("freeBytes", free)
            ret.put("usedBytes", used)
            ret.put("usedPercent", if (total > 0) (100.0 * used / total) else 0.0)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("STORAGE_ERROR", e.message, e)
        }
    }

    @PluginMethod
    fun getDeviceSignals(call: PluginCall) {
        val ret = JSObject()

        // Battery
        try {
            val bm = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            val level = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
            ret.put("batteryPercent", level)
            val chargeCounter = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CHARGE_COUNTER)
            if (chargeCounter > 0) {
                ret.put("batteryChargeCounterUaH", chargeCounter)
            }
            val statusIntent = context.registerReceiver(
                null,
                android.content.IntentFilter(Intent.ACTION_BATTERY_CHANGED),
            )
            if (statusIntent != null) {
                val status = statusIntent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
                val plugged = statusIntent.getIntExtra(BatteryManager.EXTRA_PLUGGED, 0)
                ret.put(
                    "batteryCharging",
                    status == BatteryManager.BATTERY_STATUS_CHARGING ||
                        status == BatteryManager.BATTERY_STATUS_FULL,
                )
                ret.put("batteryPlugged", plugged != 0)
            }
        } catch (_: Exception) {
            // optional
        }

        // Network
        try {
            val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val network = cm.activeNetwork
            val caps = if (network != null) cm.getNetworkCapabilities(network) else null
            val transport = when {
                caps == null -> "none"
                caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "wifi"
                caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "cellular"
                caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "ethernet"
                else -> "other"
            }
            ret.put("networkTransport", transport)
            ret.put(
                "networkValidated",
                caps?.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED) == true,
            )
        } catch (_: Exception) {
            ret.put("networkTransport", "unknown")
        }

        call.resolve(ret)
    }

    private fun hasUsageAccess(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName,
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName,
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }
}
