public enum LegacyOwnerMigration {
    public static func migrate(
        storage: OwnerStoring,
        legacyOwnerId: String?,
        incomingOwnerId: String
    ) throws {
        let shouldMigrate: Bool = LegacyOwnerPolicy.shouldMigrate(
            storedOwnerId: storage.loadOwnerId(),
            legacyOwnerId: legacyOwnerId,
            incomingOwnerId: incomingOwnerId
        )
        if shouldMigrate { try storage.saveOwnerId(incomingOwnerId) }
    }
}
