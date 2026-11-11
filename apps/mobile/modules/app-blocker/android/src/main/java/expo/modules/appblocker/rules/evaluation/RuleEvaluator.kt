package expo.modules.appblocker.rules.evaluation

import expo.modules.appblocker.rules.model.NativeRule
import expo.modules.appblocker.rules.model.TimeWindow

object RuleEvaluator {
  fun isBlocked(rule: NativeRule, dayOfWeek: Int, minuteOfDay: Int): Boolean {
    if (rule.always) return true
    return rule.windows.none { isWithin(it, dayOfWeek, minuteOfDay) }
  }

  private fun isWithin(window: TimeWindow, dayOfWeek: Int, minuteOfDay: Int): Boolean {
    val start = window.startMinute
    val end = window.endMinute
    if (start == end) return false

    val startsToday = dayOfWeek in window.days
    if (start < end) return startsToday && minuteOfDay >= start && minuteOfDay < end

    val startedYesterday = previousDay(dayOfWeek) in window.days
    val inEveningPart = startsToday && minuteOfDay >= start
    val inMorningPart = startedYesterday && minuteOfDay < end
    return inEveningPart || inMorningPart
  }

  private fun previousDay(dayOfWeek: Int): Int = (dayOfWeek + 6) % 7
}
