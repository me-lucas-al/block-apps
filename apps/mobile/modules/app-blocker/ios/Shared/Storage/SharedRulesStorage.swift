import Foundation

struct SharedRulesStorage {
    private let rulesKey: String = "rules.json"
    private let ownerKey: String = "rules.ownerId"
    private let defaults: UserDefaults?

    init(defaults: UserDefaults? = SharedDefaults.makeAppGroupDefaults()) {
        self.defaults = defaults
    }

    func saveRulesJSON(_ json: String) {
        defaults?.set(json, forKey: rulesKey)
    }

    func saveOwnerId(_ ownerId: String) {
        defaults?.set(ownerId, forKey: ownerKey)
    }

    func loadOwnerId() -> String? {
        return defaults?.string(forKey: ownerKey)
    }

    func loadRules() -> [BlockingRule]? {
        guard let json: String = defaults?.string(forKey: rulesKey) else { return nil }
        return try? RuleParser.parseRules(fromJSON: json)
    }
}
