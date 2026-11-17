struct MigrateLegacyOwnerUseCase {
    private let rulesStorage: SharedRulesStorage

    init(rulesStorage: SharedRulesStorage = SharedRulesStorage()) {
        self.rulesStorage = rulesStorage
    }

    func migrateLegacyOwner(legacyOwnerId: String?, incomingOwnerId: String) throws {
        let shouldMigrate: Bool = LegacyOwnerPolicy.shouldMigrate(
            storedOwnerId: rulesStorage.loadOwnerId(),
            legacyOwnerId: legacyOwnerId,
            incomingOwnerId: incomingOwnerId
        )
        if shouldMigrate { try rulesStorage.saveOwnerId(incomingOwnerId) }
    }
}
