import Foundation

struct SharedRulesStorage {
    private let rulesKey = "rules.json"
    private let defaults: UserDefaults?

    init(defaults: UserDefaults? = SharedDefaults.makeAppGroupDefaults()) {
        self.defaults = defaults
    }

    func saveRulesJSON(_ json: String) {
        defaults?.set(json, forKey: rulesKey)
    }

    func loadRules() -> [BlockingRule]? {
        guard let defaults = defaults else { return nil }
        guard let json = defaults.string(forKey: rulesKey) else { return [] }
        return try? RuleParser.parseRules(fromJSON: json)
    }
}
