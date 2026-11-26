package expo.modules.appblocker.rules.storage

import expo.modules.appblocker.rules.ownership.RulesOwnedByAnotherAccountException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class RulesInstallerTest {
  private val rules = """[{"target":"com.a","mode":"always","windows":[]}]"""
  private val otherRules = """[{"target":"com.b","mode":"always","windows":[]}]"""

  @Test
  fun theFirstInstallStoresTheRulesAndTheOwner() {
    val storage = FakeRulesStorage()
    RulesInstaller(storage).install(rules, "sub-1", null)
    assertEquals(rules, storage.rulesJson)
    assertEquals("sub-1", storage.ownerId)
  }

  @Test(expected = RulesOwnedByAnotherAccountException::class)
  fun anotherAccountCannotReplaceTheRulesInForce() {
    RulesInstaller(FakeRulesStorage(rules, "sub-1")).install(otherRules, "sub-2", null)
  }

  @Test
  fun theRulesStayUntouchedWhenAnotherAccountIsRefused() {
    val storage = FakeRulesStorage(rules, "sub-1")
    runCatching { RulesInstaller(storage).install(otherRules, "sub-2", null) }
    assertEquals(rules, storage.rulesJson)
    assertEquals("sub-1", storage.ownerId)
  }

  @Test
  fun anotherAccountTakesOverWhenTheOwnerHasNoRulesLeft() {
    val storage = FakeRulesStorage("[]", "sub-1")
    RulesInstaller(storage).install(otherRules, "sub-2", null)
    assertEquals("sub-2", storage.ownerId)
  }

  @Test
  fun anEmptyListWithSpacesCountsAsNoRulesLeft() {
    val storage = FakeRulesStorage("[ ]", "sub-1")
    RulesInstaller(storage).install(otherRules, "sub-2", null)
    assertEquals("sub-2", storage.ownerId)
  }

  @Test(expected = RulesOwnedByAnotherAccountException::class)
  fun unreadableStoredRulesCountAsRulesInForce() {
    RulesInstaller(FakeRulesStorage("garbage", "sub-1")).install(otherRules, "sub-2", null)
  }

  @Test
  fun rulesStoredBeforeTheOwnerExistedAreAdoptedByTheFirstAccountToSync() {
    val storage = FakeRulesStorage(rules, null)
    RulesInstaller(storage).install(otherRules, "sub-1", null)
    assertEquals("sub-1", storage.ownerId)
  }

  @Test
  fun invalidRulesChangeNothing() {
    val storage = FakeRulesStorage()
    runCatching { RulesInstaller(storage).install("not json", "sub-1", null) }
    assertNull(storage.ownerId)
    assertNull(storage.rulesJson)
  }
}
