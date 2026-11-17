package expo.modules.appblocker.rules.storage

import android.content.Context
import expo.modules.appblocker.rules.model.NativeRule

class RuleStore(context: Context) : RulesStorage {
  private val preferences =
    context.applicationContext.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

  override fun saveRulesJson(rulesJson: String) {
    preferences.edit().putString(RULES_KEY, rulesJson).commit()
  }

  override fun readRulesJson(): String? = preferences.getString(RULES_KEY, null)

  override fun saveOwnerId(ownerId: String) {
    preferences.edit().putString(OWNER_KEY, ownerId).commit()
  }

  override fun readOwnerId(): String? = preferences.getString(OWNER_KEY, null)

  fun load(): List<NativeRule> {
    val rulesJson = readRulesJson() ?: return emptyList()
    return ParsedRulesCache.parse(rulesJson)
  }

  private companion object {
    const val PREFERENCES_NAME = "app_blocker_rules"
    const val RULES_KEY = "rules"
    const val OWNER_KEY = "rules_owner_id"
  }
}
