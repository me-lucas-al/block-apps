package expo.modules.appblocker.rules.ownership

enum class RulesOwnershipDecision { ACCEPT, REJECT_BECAUSE_ANOTHER_ACCOUNT_OWNS_THE_RULES }

object RulesOwnershipPolicy {
  fun decide(
    storedOwnerId: String?,
    incomingOwnerId: String,
    hasStoredRules: Boolean,
  ): RulesOwnershipDecision {
    if (storedOwnerId == null) return RulesOwnershipDecision.ACCEPT
    if (storedOwnerId == incomingOwnerId) return RulesOwnershipDecision.ACCEPT
    if (!hasStoredRules) return RulesOwnershipDecision.ACCEPT
    return RulesOwnershipDecision.REJECT_BECAUSE_ANOTHER_ACCOUNT_OWNS_THE_RULES
  }
}
