package expo.modules.appblocker.rules.evaluation

import expo.modules.appblocker.rules.model.NativeRule
import expo.modules.appblocker.rules.model.TimeWindow

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class RuleEvaluatorTest {
  private val monday = 1
  private val friday = 5
  private val saturday = 6
  private val sunday = 0

  private fun minutes(hours: Int, minutes: Int = 0) = hours * 60 + minutes

  private fun scheduled(vararg windows: TimeWindow) =
    NativeRule("com.example", always = false, windows = windows.toList())

  @Test
  fun alwaysModeIsAlwaysBlocked() {
    val rule = NativeRule("com.example", always = true, windows = emptyList())
    assertTrue(RuleEvaluator.isBlocked(rule, monday, minutes(12)))
  }

  @Test
  fun scheduledWithoutWindowsIsBlocked() {
    assertTrue(RuleEvaluator.isBlocked(scheduled(), monday, minutes(12)))
  }

  @Test
  fun insideAllowedWindowIsNotBlocked() {
    val rule = scheduled(TimeWindow(setOf(monday), minutes(18), minutes(20)))
    assertFalse(RuleEvaluator.isBlocked(rule, monday, minutes(19)))
  }

  @Test
  fun startIsAllowedAndEndIsBlocked() {
    val rule = scheduled(TimeWindow(setOf(monday), minutes(18), minutes(20)))
    assertFalse(RuleEvaluator.isBlocked(rule, monday, minutes(18)))
    assertTrue(RuleEvaluator.isBlocked(rule, monday, minutes(20)))
  }

  @Test
  fun otherDaysAreBlocked() {
    val rule = scheduled(TimeWindow(setOf(monday), minutes(18), minutes(20)))
    assertTrue(RuleEvaluator.isBlocked(rule, friday, minutes(19)))
  }

  @Test
  fun windowCrossingMidnightAllowsBothParts() {
    val rule = scheduled(TimeWindow(setOf(friday), minutes(22), minutes(2)))
    assertFalse(RuleEvaluator.isBlocked(rule, friday, minutes(23)))
    assertFalse(RuleEvaluator.isBlocked(rule, saturday, minutes(1)))
    assertTrue(RuleEvaluator.isBlocked(rule, friday, minutes(1)))
    assertTrue(RuleEvaluator.isBlocked(rule, saturday, minutes(2)))
  }

  @Test
  fun windowCrossingMidnightWrapsFromSaturdayToSunday() {
    val rule = scheduled(TimeWindow(setOf(saturday), minutes(23), minutes(1)))
    assertFalse(RuleEvaluator.isBlocked(rule, sunday, minutes(0, 30)))
  }

  @Test
  fun zeroLengthWindowNeverAllows() {
    val rule = scheduled(TimeWindow(setOf(monday), minutes(10), minutes(10)))
    assertTrue(RuleEvaluator.isBlocked(rule, monday, minutes(10)))
  }
}
