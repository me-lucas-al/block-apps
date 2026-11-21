package expo.modules.appblocker.rules.storage

import org.json.JSONArray
import org.json.JSONObject

object RuleIdReader {
  fun readIds(rulesJson: String): Set<String>? =
    runCatching { toIds(JSONArray(rulesJson)) }.getOrNull()

  private fun toIds(rules: JSONArray): Set<String> =
    (0 until rules.length()).map { toId(rules.getJSONObject(it)) }.toSet()

  private fun toId(rule: JSONObject): String {
    val idFromTarget = "app~${rule.getString("target")}"
    if (rule.isNull("id")) return idFromTarget
    return rule.getString("id").ifEmpty { idFromTarget }
  }
}
