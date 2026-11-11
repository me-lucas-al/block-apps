package expo.modules.appblocker.rules

internal object ParsedRulesCache {
  private var lastJson: String? = null
  private var lastRules: List<NativeRule> = emptyList()

  @Synchronized
  fun parse(rulesJson: String): List<NativeRule> {
    if (rulesJson == lastJson) return lastRules
    lastRules = RuleParser.parse(rulesJson)
    lastJson = rulesJson
    return lastRules
  }
}
