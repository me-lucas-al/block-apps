package expo.modules.appblocker.rules.ownership

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class LegacyOwnerPolicyTest {
  private fun shouldMigrate(
    stored: String?,
    legacy: String?,
    incoming: String = "sub-1",
    storedRuleIds: Set<String>? = setOf("rule-1"),
    incomingRuleIds: Set<String> = setOf("rule-1"),
  ) = LegacyOwnerPolicy.shouldMigrate(stored, legacy, incoming, storedRuleIds, incomingRuleIds)

  @Test
  fun anOwnerStoredAsTheAccountEmailMigratesToTheSub() {
    assertTrue(shouldMigrate("a@b.c", "a@b.c"))
  }

  @Test
  fun anotherAccountsEmailDoesNotMigrate() {
    assertFalse(shouldMigrate("other@b.c", "a@b.c"))
  }

  @Test
  fun nothingStoredOrNoLegacyIdDoesNotMigrate() {
    assertFalse(shouldMigrate(null, "a@b.c"))
    assertFalse(shouldMigrate("a@b.c", null))
  }

  @Test
  fun anOwnerAlreadyStoredAsTheSubDoesNotMigrate() {
    assertFalse(shouldMigrate("sub-1", "sub-1"))
  }

  @Test
  fun aReusedEmailWithNoRuleInCommonDoesNotMigrate() {
    assertFalse(shouldMigrate("a@b.c", "a@b.c", incomingRuleIds = setOf("rule-9")))
  }

  @Test
  fun aReusedEmailSyncingAnEmptyListDoesNotMigrate() {
    assertFalse(shouldMigrate("a@b.c", "a@b.c", incomingRuleIds = emptySet()))
  }

  @Test
  fun oneRuleInCommonIsEnoughToMigrate() {
    assertTrue(
      shouldMigrate(
        "a@b.c",
        "a@b.c",
        storedRuleIds = setOf("rule-1", "rule-2"),
        incomingRuleIds = setOf("rule-2", "rule-3"),
      ),
    )
  }

  @Test
  fun aDeviceWithoutStoredRulesMigratesFreely() {
    assertTrue(shouldMigrate("a@b.c", "a@b.c", storedRuleIds = emptySet(), incomingRuleIds = emptySet()))
  }

  @Test
  fun unreadableStoredRulesDoNotMigrate() {
    assertFalse(shouldMigrate("a@b.c", "a@b.c", storedRuleIds = null))
  }
}
