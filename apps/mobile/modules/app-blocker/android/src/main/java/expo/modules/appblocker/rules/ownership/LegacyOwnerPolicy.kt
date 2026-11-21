package expo.modules.appblocker.rules.ownership

object LegacyOwnerPolicy {
  fun shouldMigrate(
    storedOwnerId: String?,
    legacyOwnerId: String?,
    incomingOwnerId: String,
    storedRuleIds: Set<String>?,
    incomingRuleIds: Set<String>,
  ): Boolean {
    if (storedOwnerId == null || legacyOwnerId == null) return false
    if (storedOwnerId == incomingOwnerId) return false
    if (storedOwnerId != legacyOwnerId) return false
    return provesPossession(storedRuleIds, incomingRuleIds)
  }

  private fun provesPossession(storedRuleIds: Set<String>?, incomingRuleIds: Set<String>): Boolean {
    if (storedRuleIds == null) return false
    if (storedRuleIds.isEmpty()) return true
    return storedRuleIds.any { it in incomingRuleIds }
  }
}
