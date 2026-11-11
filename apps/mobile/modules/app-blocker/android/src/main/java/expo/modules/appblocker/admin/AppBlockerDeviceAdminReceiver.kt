package expo.modules.appblocker.admin

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import expo.modules.appblocker.R

class AppBlockerDeviceAdminReceiver : DeviceAdminReceiver() {
  override fun onDisableRequested(context: Context, intent: Intent): CharSequence =
    context.getString(R.string.app_blocker_admin_disable_warning)
}
