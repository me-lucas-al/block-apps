public enum LegacyOwnerMigration {
    public static func migrate(
        storage: OwnerStoring,
        legacyOwnerId: String?,
        incomingOwnerId: String,
        incomingRuleIds: Set<String>
    ) throws {
        let shouldMigrate: Bool = LegacyOwnerPolicy.shouldMigrate(
            storedOwnerId: storage.loadOwnerId(),
            legacyOwnerId: legacyOwnerId,
            incomingOwnerId: incomingOwnerId,
            storedRuleIds: storage.loadStoredRuleIds(),
            incomingRuleIds: incomingRuleIds
        )
        if shouldMigrate { try storage.saveOwnerId(incomingOwnerId) }
    }
}
