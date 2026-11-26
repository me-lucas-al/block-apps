@testable import BlockingCore

extension FakeOwnerStorage {
    func migrateLegacyOwnerToSubOne(
        legacyOwnerId: String? = "a@b.c",
        incomingRuleIds: Set<String> = ["rule-1"]
    ) throws {
        try LegacyOwnerMigration.migrate(
            storage: self,
            legacyOwnerId: legacyOwnerId,
            incomingOwnerId: "sub-1",
            incomingRuleIds: incomingRuleIds
        )
    }
}
