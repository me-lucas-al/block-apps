package expo.modules.appblocker.boot

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import expo.modules.appblocker.sync.RulesSyncWorker
import java.util.concurrent.TimeUnit

class BootCompletedReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val action = intent.action
    if (action != Intent.ACTION_BOOT_COMPLETED && action != Intent.ACTION_MY_PACKAGE_REPLACED) return

    val request = PeriodicWorkRequestBuilder<RulesSyncWorker>(15, TimeUnit.MINUTES).build()
    WorkManager.getInstance(context).enqueueUniquePeriodicWork(
      RulesSyncWorker.WORK_NAME,
      ExistingPeriodicWorkPolicy.UPDATE,
      request,
    )
  }
}
