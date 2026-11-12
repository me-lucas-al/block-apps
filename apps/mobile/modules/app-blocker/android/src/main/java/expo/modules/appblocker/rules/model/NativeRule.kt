package expo.modules.appblocker.rules.model

data class NativeRule(
  val target: String,
  val always: Boolean,
  val windows: List<TimeWindow>,
)
