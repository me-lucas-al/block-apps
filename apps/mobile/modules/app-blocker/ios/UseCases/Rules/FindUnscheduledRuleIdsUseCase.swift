struct FindUnscheduledRuleIdsUseCase {
    private let rulesStorage: SharedRulesStorage

    init(rulesStorage: SharedRulesStorage = SharedRulesStorage()) {
        self.rulesStorage = rulesStorage
    }

    func findUnscheduledRuleIds() -> [String] {
        let rules: [BlockingRule] = rulesStorage.loadRules() ?? []
        return Array(ShieldSchedulePlanner.plan(rules: rules).unscheduledRuleIds)
    }
}
