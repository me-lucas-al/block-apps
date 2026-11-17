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
        let initial = selectionStorage.loadSelection(ruleId: ruleId) ?? FamilyActivitySelection()
        guard let chosen = await AppSelectionPresenter.presentPicker(startingFrom: initial) else {
            return "cancelled"
        }
        let outcome = saveChosenSelection.saveChosenSelection(chosen, ruleId: ruleId)
        shieldApplier.applyShieldsForCurrentMoment()
        return outcome
    }
}
