package expo.modules.appblocker.rules.model

data class TimeWindow(
  val days: Set<Int>,
  val startMinute: Int,
  val endMinute: Int,
)
