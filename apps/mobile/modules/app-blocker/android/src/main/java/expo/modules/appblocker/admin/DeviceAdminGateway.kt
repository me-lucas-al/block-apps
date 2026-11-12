package expo.modules.appblocker.admin

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import expo.modules.appblocker.R

class DeviceAdminGateway(private val context: Context) {
  private val admin = ComponentName(context, AppBlockerDeviceAdminReceiver::class.java)

  fun isActive(): Boolean {
    val policyManager = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
    return policyManager.isAdminActive(admin)
  }

  fun requestActivation() {
    val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN)
      .putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, admin)
      .putExtra(
        DevicePolicyManager.EXTRA_ADD_EXPLANATION,
        context.getString(R.string.app_blocker_admin_explanation),
      )
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    context.startActivity(intent)
  }
}
