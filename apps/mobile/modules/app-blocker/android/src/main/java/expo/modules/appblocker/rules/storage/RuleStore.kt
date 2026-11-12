package expo.modules.appblocker.rules.storage

import android.content.Context
import expo.modules.appblocker.rules.model.NativeRule

class RuleStore(context: Context) {
  private val preferences =
    context.applicationContext.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

  fun save(rulesJson: String) {
    RuleParser.parse(rulesJson)
    preferences.edit().putString(RULES_KEY, rulesJson).commit()
  }

  fun load(): List<NativeRule> {
    val rulesJson = preferences.getString(RULES_KEY, null) ?: return emptyList()
    return ParsedRulesCache.parse(rulesJson)
  }

  private companion object {
    const val PREFERENCES_NAME = "app_blocker_rules"
    const val RULES_KEY = "rules"
  }
}
