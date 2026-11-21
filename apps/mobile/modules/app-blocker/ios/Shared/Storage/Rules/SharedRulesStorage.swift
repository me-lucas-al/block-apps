import Foundation

struct SharedRulesStorage {
    private let rulesKey: String = "rules.json"
    private let ownerKey: String = "rules.ownerId"
    private let defaults: UserDefaults?

    init(defaults: UserDefaults? = SharedDefaults.makeAppGroupDefaults()) {
        self.defaults = defaults
    }

    func saveRulesJSON(_ json: String) throws {
        try SharedDefaults.requireDefaults(defaults).set(json, forKey: rulesKey)
    }

    func saveOwnerId(_ ownerId: String) throws {
        try SharedDefaults.requireDefaults(defaults).set(ownerId, forKey: ownerKey)
    }

    func loadOwnerId() -> String? {
        return defaults?.string(forKey: ownerKey)
    }

    func loadStoredRuleIds() -> Set<String>? {
        guard defaults?.string(forKey: rulesKey) != nil else { return [] }
        guard let storedRules: [BlockingRule] = loadRules() else { return nil }
        return Set(storedRules.map { (rule: BlockingRule) -> String in rule.id })
    }

    func loadRules() -> [BlockingRule]? {
        guard let json: String = defaults?.string(forKey: rulesKey) else { return nil }
        do {
            return try RuleParser.parseRules(fromJSON: json)
        } catch {
            AppLogger.storage.error("Stored rules are unreadable: \(String(describing: error), privacy: .public)")
            return nil
        }
    }
}
