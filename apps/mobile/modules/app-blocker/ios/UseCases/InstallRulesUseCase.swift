import Foundation

enum InstallRulesError: Error {
    case anotherAccountOwnsTheRules
}

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

    func installRules(fromJSON rulesJson: String, ownerId: String) throws {
        let rules: [BlockingRule] = try RuleParser.parseRules(fromJSON: rulesJson)
        try requireRulesCanBeReplaced(byOwnerId: ownerId)
        rulesStorage.saveOwnerId(ownerId)
        rulesStorage.saveRulesJSON(rulesJson)
        shieldApplier.applyShieldsForCurrentMoment()
        try scheduleRegistrar.registerActivities(of: ShieldSchedulePlanner.plan(rules: rules))
    }

    private func requireRulesCanBeReplaced(byOwnerId ownerId: String) throws {
        let storedRules: [BlockingRule]? = rulesStorage.loadRules()
        let decision: RulesOwnershipDecision = RulesOwnershipPolicy.decide(
            storedOwnerId: rulesStorage.loadOwnerId(),
            incomingOwnerId: ownerId,
            hasStoredRules: (storedRules?.isEmpty ?? false) == false
        )
        if decision == .rejectBecauseAnotherAccountOwnsTheRules {
            throw InstallRulesError.anotherAccountOwnsTheRules
        }
    }
}
