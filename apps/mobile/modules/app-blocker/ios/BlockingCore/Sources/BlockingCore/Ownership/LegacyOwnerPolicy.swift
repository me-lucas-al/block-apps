public enum LegacyOwnerPolicy {
    public static func shouldMigrate(
        storedOwnerId: String?,
        legacyOwnerId: String?,
        incomingOwnerId: String,
        storedRuleIds: Set<String>?,
        incomingRuleIds: Set<String>
    ) -> Bool {
        guard let storedOwnerId: String = storedOwnerId, let legacyOwnerId: String = legacyOwnerId else {
            return false
        }
        if storedOwnerId == incomingOwnerId { return false }
        if storedOwnerId != legacyOwnerId { return false }
        return provesPossession(storedRuleIds: storedRuleIds, incomingRuleIds: incomingRuleIds)
    }

    private static func provesPossession(storedRuleIds: Set<String>?, incomingRuleIds: Set<String>) -> Bool {
        guard let storedRuleIds: Set<String> = storedRuleIds else { return false }
        if storedRuleIds.isEmpty { return true }
        return !storedRuleIds.isDisjoint(with: incomingRuleIds)
    }
}
