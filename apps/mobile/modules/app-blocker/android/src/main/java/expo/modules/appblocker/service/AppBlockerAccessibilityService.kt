package expo.modules.appblocker.service

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import expo.modules.appblocker.rules.BlockDecider
import expo.modules.appblocker.rules.RuleStore
import expo.modules.appblocker.ui.BlockActivity

class AppBlockerAccessibilityService : AccessibilityService() {
  private var decider: BlockDecider? = null

  override fun onServiceConnected() {
    decider = BlockDecider(RuleStore(this), packageName)
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    val foregroundPackage = event.packageName?.toString() ?: return
    if (decider?.shouldBlock(foregroundPackage) != true) return

    performGlobalAction(GLOBAL_ACTION_HOME)
    startActivity(BlockActivity.createIntent(this, foregroundPackage))
  }

  override fun onInterrupt() = Unit
}
