@testable import BlockingCore

final class FakeOwnerStorage: OwnerStoring {
    var ownerId: String?
    var storedRuleIds: Set<String>?
    var savedOwnerIds: [String] = []
    var failsToSave: Bool = false

    init(ownerId: String?, storedRuleIds: Set<String>? = ["rule-1"]) {
        self.ownerId = ownerId
        self.storedRuleIds = storedRuleIds
    }

    func loadOwnerId() -> String? {
        return ownerId
    }

    func loadStoredRuleIds() -> Set<String>? {
        return storedRuleIds
    }

    func saveOwnerId(_ ownerId: String) throws {
        if failsToSave { throw RuleParsingError.malformedDocument }
        self.ownerId = ownerId
        savedOwnerIds.append(ownerId)
    }

    func migrateToSubOne(legacyOwnerId: String? = "a@b.c", incomingRuleIds: Set<String> = ["rule-1"]) throws {
        try LegacyOwnerMigration.migrate(
            storage: self,
            legacyOwnerId: legacyOwnerId,
            incomingOwnerId: "sub-1",
            incomingRuleIds: incomingRuleIds
        )
    }
}
