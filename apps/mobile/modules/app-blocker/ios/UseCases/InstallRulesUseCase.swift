import Foundation

enum InstallRulesError: Error {
    case anotherAccountOwnsTheRules
}

struct InstallRulesUseCase {
    private let rulesStorage: SharedRulesStorage
    private let scheduleRegistrar: ScheduleRegistrar
    private let shieldApplier: ShieldApplier
    private let ownershipGuard: RulesOwnershipGuard
    private let settleHeldRemovals: SettleHeldRemovalsUseCase

    init(
        rulesStorage: SharedRulesStorage = SharedRulesStorage(),
        scheduleRegistrar: ScheduleRegistrar = ScheduleRegistrar(),
        shieldApplier: ShieldApplier = ShieldApplier(),
        ownershipGuard: RulesOwnershipGuard = RulesOwnershipGuard(),
        settleHeldRemovals: SettleHeldRemovalsUseCase = SettleHeldRemovalsUseCase()
    ) {
        self.rulesStorage = rulesStorage
        self.scheduleRegistrar = scheduleRegistrar
        self.shieldApplier = shieldApplier
        self.ownershipGuard = ownershipGuard
        self.settleHeldRemovals = settleHeldRemovals
    }

    func installRules(
        fromJSON rulesJson: String,
        ownerId: String,
        pendingRuleIds: [String],
        serverNowIso: String?
    ) throws {
        let rules: [BlockingRule] = try RuleParser.parseRules(fromJSON: rulesJson)
        try ownershipGuard.requireOwnership(byOwnerId: ownerId)
        settleHeldRemovals.settleHeldRemovals(
            ruleIds: selectionRuleIds(in: rules),
            pendingRuleIds: Set(pendingRuleIds),
            serverNowIso: serverNowIso
        )
        try rulesStorage.saveOwnerId(ownerId)
        try rulesStorage.saveRulesJSON(rulesJson)
        defer { shieldApplier.applyShieldsForCurrentMoment() }
        try scheduleRegistrar.registerActivities(of: ShieldSchedulePlanner.plan(rules: rules))
    }

    private func selectionRuleIds(in rules: [BlockingRule]) -> [String] {
        return rules
            .filter { (rule: BlockingRule) -> Bool in rule.kind == .iosSelection }
            .map { (rule: BlockingRule) -> String in rule.id }
    }
}
