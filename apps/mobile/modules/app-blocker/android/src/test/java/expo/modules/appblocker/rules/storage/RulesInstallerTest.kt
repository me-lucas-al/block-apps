package expo.modules.appblocker.rules.storage

import expo.modules.appblocker.rules.ownership.RulesOwnedByAnotherAccountException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class RulesInstallerTest {
  private class FakeRulesStorage(var rulesJson: String? = null, var ownerId: String? = null) : RulesStorage {
    override fun readRulesJson() = rulesJson

    override fun saveRulesJson(rulesJson: String) {
      this.rulesJson = rulesJson
    }

    override fun readOwnerId() = ownerId

    override fun saveOwnerId(ownerId: String) {
      this.ownerId = ownerId
    }
  }

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
  fun anOwnerStoredAsTheEmailMigratesToTheSub() {
    val storage = FakeRulesStorage(rules, "a@b.c")
    RulesInstaller(storage).install(otherRules, "sub-1", "a@b.c")
    assertEquals("sub-1", storage.ownerId)
    assertEquals(otherRules, storage.rulesJson)
  }

  @Test
  fun invalidRulesChangeNothing() {
    val storage = FakeRulesStorage()
    runCatching { RulesInstaller(storage).install("not json", "sub-1", null) }
    assertNull(storage.ownerId)
    assertNull(storage.rulesJson)
  }
}
