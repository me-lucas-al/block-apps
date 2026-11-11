package expo.modules.appblocker.system

import android.content.Context
import android.content.Intent

class InstalledApps(private val context: Context) {
  fun listLaunchable(): List<Map<String, String>> {
    val packageManager = context.packageManager
    val launcherIntent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)

    return packageManager.queryIntentActivities(launcherIntent, 0)
      .map {
        mapOf(
          "packageName" to it.activityInfo.packageName,
          "label" to it.loadLabel(packageManager).toString(),
        )
      }
      .filter { it["packageName"] != context.packageName }
      .distinctBy { it["packageName"] }
      .sortedBy { it["label"]?.lowercase() }
  }
}
