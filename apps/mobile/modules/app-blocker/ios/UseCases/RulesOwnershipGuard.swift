struct RulesOwnershipGuard {
    private let rulesStorage: SharedRulesStorage

    init(rulesStorage: SharedRulesStorage = SharedRulesStorage()) {
        self.rulesStorage = rulesStorage
    }

    func requireOwnership(byOwnerId ownerId: String) throws {
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
