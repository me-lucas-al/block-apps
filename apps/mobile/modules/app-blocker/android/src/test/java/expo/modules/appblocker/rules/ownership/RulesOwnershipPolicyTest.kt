package expo.modules.appblocker.rules.ownership

import org.junit.Assert.assertEquals
import org.junit.Test

class RulesOwnershipPolicyTest {
  @Test
  fun theFirstAccountToInstallRulesIsAccepted() {
    val decision = RulesOwnershipPolicy.decide(null, "a", hasStoredRules = true)
    assertEquals(RulesOwnershipDecision.ACCEPT, decision)
  }

  @Test
  fun theSameAccountMayReplaceItsRules() {
    val decision = RulesOwnershipPolicy.decide("a", "a", hasStoredRules = true)
    assertEquals(RulesOwnershipDecision.ACCEPT, decision)
  }

  @Test
  fun anotherAccountCannotReplaceRulesThatAreStillInForce() {
    val decision = RulesOwnershipPolicy.decide("a", "b", hasStoredRules = true)
    assertEquals(RulesOwnershipDecision.REJECT_BECAUSE_ANOTHER_ACCOUNT_OWNS_THE_RULES, decision)
  }

  @Test
  fun anotherAccountMayTakeOverOnceTheOwnerHasNoRulesLeft() {
    val decision = RulesOwnershipPolicy.decide("a", "b", hasStoredRules = false)
    assertEquals(RulesOwnershipDecision.ACCEPT, decision)
  }
}
