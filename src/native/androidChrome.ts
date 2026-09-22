import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { runBackHandlers } from './backStack'

/** Status bar overlay + hardware back interception for Capacitor Android. */
export async function initAndroidChrome(
  onUnhandledBack: () => boolean | void,
): Promise<() => void> {
  if (!Capacitor.isNativePlatform()) {
    return () => {}
  }

  try {
    await StatusBar.setOverlaysWebView({ overlay: true })
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#0f172a' })
  } catch {
    // StatusBar may be unavailable in some WebViews; CSS padding still applies.
  }

  const handle = await CapApp.addListener('backButton', () => {
    if (runBackHandlers()) return
    const stayed = onUnhandledBack()
    if (stayed === true) return
    void CapApp.exitApp()
  })

  return () => {
    void handle.remove()
  }
}
