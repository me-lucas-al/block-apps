import FamilyControls

@MainActor
struct ChooseAppsUseCase {
    private let selectionStorage: SelectionStorage
    private let saveChosenSelection: SaveChosenSelectionUseCase
    private let shieldApplier: ShieldApplier

    init(
        selectionStorage: SelectionStorage = SelectionStorage(),
        saveChosenSelection: SaveChosenSelectionUseCase = SaveChosenSelectionUseCase(),
        shieldApplier: ShieldApplier = ShieldApplier()
    ) {
        self.selectionStorage = selectionStorage
        self.saveChosenSelection = saveChosenSelection
        self.shieldApplier = shieldApplier
    }

    func chooseApps(forRuleId ruleId: String) async -> String {
        if ScreenTimeAuthorization.readStatusName() != "approved" { return "notAuthorized" }
        let storedSelection: FamilyActivitySelection? = selectionStorage.loadSelection(ruleId: ruleId)
        let initial: FamilyActivitySelection = storedSelection ?? FamilyActivitySelection()
        let pickedSelection: FamilyActivitySelection? = await AppSelectionPresenter.presentPicker(startingFrom: initial)
        guard let chosen: FamilyActivitySelection = pickedSelection else { return "cancelled" }
        let outcome: String = saveChosenSelection.saveChosenSelection(chosen, ruleId: ruleId)
        shieldApplier.applyShieldsForCurrentMoment()
        return outcome
    }
}
