package expo.modules.appblocker.rules.evaluation

import expo.modules.appblocker.rules.storage.RuleStore
import java.util.Calendar

class BlockDecider(
  private val store: RuleStore,
  private val ownPackageName: String,
  private val clock: () -> Calendar = { Calendar.getInstance() },
) {
  fun shouldBlock(packageName: String): Boolean {
    if (packageName == ownPackageName) return false

    val now = clock()
    val dayOfWeek = now.get(Calendar.DAY_OF_WEEK) - 1
    val minuteOfDay = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)
    return store.load().any { rule ->
      rule.target == packageName && RuleEvaluator.isBlocked(rule, dayOfWeek, minuteOfDay)
    }
  }
}
