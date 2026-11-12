package expo.modules.appblocker.system

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import expo.modules.appblocker.service.AppBlockerAccessibilityService

class AccessibilityStatus(private val context: Context) {
  fun isEnabled(): Boolean {
    val enabledServices = Settings.Secure.getString(
      context.contentResolver,
      Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
    ) ?: return false

    val expected = ComponentName(context, AppBlockerAccessibilityService::class.java)
    return enabledServices
      .split(':')
      .mapNotNull(ComponentName::unflattenFromString)
      .any { it == expected }
  }

  fun openSettings() {
    val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    context.startActivity(intent)
  }
}
