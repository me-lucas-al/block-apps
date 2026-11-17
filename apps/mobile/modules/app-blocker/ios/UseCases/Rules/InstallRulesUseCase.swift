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
    private let migrateLegacyOwner: MigrateLegacyOwnerUseCase

    init(
        rulesStorage: SharedRulesStorage = SharedRulesStorage(),
        scheduleRegistrar: ScheduleRegistrar = ScheduleRegistrar(),
        shieldApplier: ShieldApplier = ShieldApplier(),
        ownershipGuard: RulesOwnershipGuard = RulesOwnershipGuard(),
        settleHeldRemovals: SettleHeldRemovalsUseCase = SettleHeldRemovalsUseCase(),
        migrateLegacyOwner: MigrateLegacyOwnerUseCase = MigrateLegacyOwnerUseCase()
    ) {
        self.rulesStorage = rulesStorage
        self.scheduleRegistrar = scheduleRegistrar
        self.shieldApplier = shieldApplier
        self.ownershipGuard = ownershipGuard
        self.settleHeldRemovals = settleHeldRemovals
        self.migrateLegacyOwner = migrateLegacyOwner
    }

    func installRules(_ request: SetRulesRequest) throws {
        let rules: [BlockingRule] = try RuleParser.parseRules(fromJSON: request.rulesJson)
        try migrateLegacyOwner.migrateLegacyOwner(
            legacyOwnerId: request.legacyOwnerId,
            incomingOwnerId: request.ownerId
        )
        try ownershipGuard.requireOwnership(byOwnerId: request.ownerId)
        settleHeldRemovals.settleHeldRemovals(
            ruleIds: selectionRuleIds(in: rules),
            pendingRuleIds: Set(request.pendingRuleIds),
            serverNowIso: request.serverNowIso
        )
        try rulesStorage.saveOwnerId(request.ownerId)
        try rulesStorage.saveRulesJSON(request.rulesJson)
        defer { shieldApplier.applyShieldsForCurrentMoment() }
        try scheduleRegistrar.registerActivities(of: ShieldSchedulePlanner.plan(rules: rules))
    }

    private func selectionRuleIds(in rules: [BlockingRule]) -> [String] {
        return rules
            .filter { (rule: BlockingRule) -> Bool in rule.kind == .iosSelection }
            .map { (rule: BlockingRule) -> String in rule.id }
    }
}
