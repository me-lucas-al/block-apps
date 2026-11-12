package expo.modules.appblocker.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import expo.modules.appblocker.rules.storage.RuleStore

class RulesSyncWorker(
  appContext: Context,
  params: WorkerParameters,
) : CoroutineWorker(appContext, params) {
  companion object {
    const val WORK_NAME = "block_apps_rules_sync"
  }

  override suspend fun doWork(): Result {
    val store = RuleStore(applicationContext)
    val currentJson = store.readRulesJson()
    if (currentJson.isNullOrBlank()) return Result.success()
    return Result.success()
  }
}
