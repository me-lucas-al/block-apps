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
}
