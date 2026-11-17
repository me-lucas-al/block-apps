import FamilyControls

@MainActor
struct ChooseAppsUseCase {
    private let selectionStorage: SelectionStorage
    private let saveChosenSelection: SaveChosenSelectionUseCase
    private let shieldApplier: ShieldApplier
    private let ownershipGuard: RulesOwnershipGuard

    init(
        selectionStorage: SelectionStorage = SelectionStorage(),
        saveChosenSelection: SaveChosenSelectionUseCase = SaveChosenSelectionUseCase(),
        shieldApplier: ShieldApplier = ShieldApplier(),
        ownershipGuard: RulesOwnershipGuard = RulesOwnershipGuard()
    ) {
        self.selectionStorage = selectionStorage
        self.saveChosenSelection = saveChosenSelection
        self.shieldApplier = shieldApplier
        self.ownershipGuard = ownershipGuard
    }

    func chooseApps(forRuleId ruleId: String, ownerId: String) async throws -> ChooseAppsOutcome {
        if !canActOnBehalf(of: ownerId) { return .notOwner }
        if ScreenTimeAuthorization.readStatus() != .approved { return .notAuthorized }
        let storedSelection: FamilyActivitySelection? = selectionStorage.loadSelection(ruleId: ruleId)
        let initial: FamilyActivitySelection = storedSelection ?? FamilyActivitySelection()
        let pickedSelection: FamilyActivitySelection? = try await AppSelectionPresenter.presentPicker(
            startingFrom: initial
        )
        guard let chosen: FamilyActivitySelection = pickedSelection else { return .cancelled }
        return try ModuleStateQueue.run {
            let outcome: ChooseAppsOutcome = try saveChosenSelection.saveChosenSelection(chosen, ruleId: ruleId)
            shieldApplier.applyShieldsForCurrentMoment()
            return outcome
        }
    }

    private func canActOnBehalf(of ownerId: String) -> Bool {
        do {
            try ownershipGuard.requireOwnership(byOwnerId: ownerId)
            return true
        } catch {
            return false
        }
    }
}
