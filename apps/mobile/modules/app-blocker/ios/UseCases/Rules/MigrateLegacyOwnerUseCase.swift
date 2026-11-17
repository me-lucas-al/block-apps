struct MigrateLegacyOwnerUseCase {
    private let rulesStorage: SharedRulesStorage

    init(rulesStorage: SharedRulesStorage = SharedRulesStorage()) {
        self.rulesStorage = rulesStorage
    }

    func migrateLegacyOwner(legacyOwnerId: String?, incomingOwnerId: String) throws {
        try LegacyOwnerMigration.migrate(
            storage: rulesStorage,
            legacyOwnerId: legacyOwnerId,
            incomingOwnerId: incomingOwnerId
        )
    }
}
