package expo.modules.appblocker.service

import android.accessibilityservice.AccessibilityService
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent
import expo.modules.appblocker.rules.evaluation.BlockDecider
import expo.modules.appblocker.rules.storage.RuleStore
import expo.modules.appblocker.ui.BlockActivity

class AppBlockerAccessibilityService : AccessibilityService() {
  private var decider: BlockDecider? = null
  private var foregroundPackage: String? = null
  private val recheckHandler = Handler(Looper.getMainLooper())

  private val recheckForegroundApp = object : Runnable {
    override fun run() {
      blockForegroundAppIfNeeded()
      recheckHandler.postDelayed(this, RECHECK_INTERVAL_MILLIS)
    }
  }

  override fun onServiceConnected() {
    decider = BlockDecider(RuleStore(this), packageName)
    recheckHandler.removeCallbacks(recheckForegroundApp)
    recheckHandler.postDelayed(recheckForegroundApp, RECHECK_INTERVAL_MILLIS)
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    foregroundPackage = event.packageName?.toString() ?: return
    blockForegroundAppIfNeeded()
  }

  override fun onInterrupt() = Unit

  override fun onDestroy() {
    recheckHandler.removeCallbacks(recheckForegroundApp)
    super.onDestroy()
  }

  private fun blockForegroundAppIfNeeded() {
    val currentPackage = foregroundPackage ?: return
    if (decider?.shouldBlock(currentPackage) != true) return

    performGlobalAction(GLOBAL_ACTION_HOME)
    startActivity(BlockActivity.createIntent(this, currentPackage))
  }

  private companion object {
    const val RECHECK_INTERVAL_MILLIS = 30_000L
  }
}
