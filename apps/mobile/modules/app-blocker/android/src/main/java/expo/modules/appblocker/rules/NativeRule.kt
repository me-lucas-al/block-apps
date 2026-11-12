package expo.modules.appblocker.rules

data class TimeWindow(
  val days: Set<Int>,
  val startMinute: Int,
  val endMinute: Int,
)

data class NativeRule(
  val target: String,
  val always: Boolean,
  val windows: List<TimeWindow>,
)
