import Foundation

struct InstallRulesUseCase {
    private let rulesStorage: SharedRulesStorage
    private let scheduleRegistrar: ScheduleRegistrar
    private let shieldApplier: ShieldApplier

    init(
        rulesStorage: SharedRulesStorage = SharedRulesStorage(),
        scheduleRegistrar: ScheduleRegistrar = ScheduleRegistrar(),
        shieldApplier: ShieldApplier = ShieldApplier()
    ) {
        self.rulesStorage = rulesStorage
        self.scheduleRegistrar = scheduleRegistrar
        self.shieldApplier = shieldApplier
    }

    func installRules(fromJSON rulesJson: String) throws {
        let rules = try RuleParser.parseRules(fromJSON: rulesJson)
        rulesStorage.saveRulesJSON(rulesJson)
        shieldApplier.applyShieldsForCurrentMoment()
        try scheduleRegistrar.registerActivities(of: ShieldSchedulePlanner.plan(rules: rules))
    }

    func findUnscheduledRuleIds() -> [String] {
        let plan = ShieldSchedulePlanner.plan(rules: rulesStorage.loadRules())
        return Array(plan.unscheduledRuleIds)
    }
}
