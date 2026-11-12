package expo.modules.appblocker.rules.storage

import expo.modules.appblocker.rules.model.NativeRule
import expo.modules.appblocker.rules.model.TimeWindow

import org.json.JSONArray
import org.json.JSONObject

object RuleParser {
  fun parse(json: String): List<NativeRule> {
    val array = JSONArray(json)
    return (0 until array.length()).map { toRule(array.getJSONObject(it)) }
  }

  private fun toRule(rule: JSONObject) = NativeRule(
    target = rule.getString("target"),
    always = rule.getString("mode") == "always",
    windows = parseWindows(rule.getJSONArray("windows")),
  )

  private fun parseWindows(windows: JSONArray): List<TimeWindow> =
    (0 until windows.length()).map { toWindow(windows.getJSONObject(it)) }

  private fun toWindow(window: JSONObject) = TimeWindow(
    days = parseDays(window.getJSONArray("days")),
    startMinute = parseMinutes(window.getString("start")),
    endMinute = parseMinutes(window.getString("end")),
  )

  private fun parseDays(days: JSONArray): Set<Int> =
    (0 until days.length()).map { days.getInt(it) }.toSet()

  private fun parseMinutes(timeOfDay: String): Int {
    val (hours, minutes) = timeOfDay.split(":").map { it.toInt() }
    return hours * 60 + minutes
  }
}
