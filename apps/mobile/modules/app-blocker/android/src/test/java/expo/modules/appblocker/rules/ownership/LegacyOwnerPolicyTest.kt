package expo.modules.appblocker.rules.ownership

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class LegacyOwnerPolicyTest {
  @Test
  fun anOwnerStoredAsTheAccountEmailMigratesToTheSub() {
    assertTrue(LegacyOwnerPolicy.shouldMigrate("a@b.c", "a@b.c", "sub-1"))
  }

  @Test
  fun anotherAccountsEmailDoesNotMigrate() {
    assertFalse(LegacyOwnerPolicy.shouldMigrate("other@b.c", "a@b.c", "sub-1"))
  }

  @Test
  fun nothingStoredOrNoLegacyIdDoesNotMigrate() {
    assertFalse(LegacyOwnerPolicy.shouldMigrate(null, "a@b.c", "sub-1"))
    assertFalse(LegacyOwnerPolicy.shouldMigrate("a@b.c", null, "sub-1"))
  }

  @Test
  fun anOwnerAlreadyStoredAsTheSubDoesNotMigrate() {
    assertFalse(LegacyOwnerPolicy.shouldMigrate("sub-1", "sub-1", "sub-1"))
  }
}
