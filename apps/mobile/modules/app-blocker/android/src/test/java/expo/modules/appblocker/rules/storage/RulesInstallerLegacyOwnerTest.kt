package expo.modules.appblocker.rules.storage

import expo.modules.appblocker.rules.ownership.RulesOwnedByAnotherAccountException
import org.junit.Assert.assertEquals
import org.junit.Test

class RulesInstallerLegacyOwnerTest {
  private val rules = """[{"target":"com.a","mode":"always","windows":[]}]"""
  private val otherRules = """[{"target":"com.b","mode":"always","windows":[]}]"""
  private val rulesPlusOther =
    """[{"target":"com.a","mode":"always","windows":[]},{"target":"com.b","mode":"always","windows":[]}]"""
  private val rulesWithId = """[{"id":"app~com.a","target":"com.a","mode":"always","windows":[]}]"""

  @Test
  fun anOwnerStoredAsTheEmailMigratesToTheSubWhenARuleIsInCommon() {
    val storage = FakeRulesStorage(rules, "a@b.c")
    RulesInstaller(storage).install(rulesPlusOther, "sub-1", "a@b.c")
    assertEquals("sub-1", storage.ownerId)
    assertEquals(rulesPlusOther, storage.rulesJson)
  }

  @Test(expected = RulesOwnedByAnotherAccountException::class)
  fun aReusedEmailWithNoRuleInCommonCannotTakeOverTheRules() {
    RulesInstaller(FakeRulesStorage(rules, "a@b.c")).install(otherRules, "sub-2", "a@b.c")
  }

  @Test(expected = RulesOwnedByAnotherAccountException::class)
  fun aReusedEmailSyncingAnEmptyListCannotWipeTheRules() {
    RulesInstaller(FakeRulesStorage(rules, "a@b.c")).install("[]", "sub-2", "a@b.c")
  }

  @Test
  fun theRulesAndTheOwnerStayUntouchedWhenTheLegacyOwnerCannotProveWhatItHolds() {
    val storage = FakeRulesStorage(rules, "a@b.c")
    runCatching { RulesInstaller(storage).install(otherRules, "sub-2", "a@b.c") }
    assertEquals(rules, storage.rulesJson)
    assertEquals("a@b.c", storage.ownerId)
  }

  @Test
  fun anOwnerStoredAsTheEmailMigratesFreelyWhenThereAreNoStoredRules() {
    val storage = FakeRulesStorage(null, "a@b.c")
    RulesInstaller(storage).install(otherRules, "sub-1", "a@b.c")
    assertEquals("sub-1", storage.ownerId)
  }

  @Test
  fun anOwnerStoredAsTheEmailMigratesFreelyWhenTheStoredListIsEmpty() {
    val storage = FakeRulesStorage("[]", "a@b.c")
    RulesInstaller(storage).install(otherRules, "sub-1", "a@b.c")
    assertEquals("sub-1", storage.ownerId)
  }

  @Test
  fun rulesStoredWithoutIdsStillProveTheOwnershipThroughTheirTarget() {
    val storage = FakeRulesStorage(rules, "a@b.c")
    RulesInstaller(storage).install(rulesWithId, "sub-1", "a@b.c")
    assertEquals("sub-1", storage.ownerId)
  }
}
