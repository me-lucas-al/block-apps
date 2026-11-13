import FamilyControls

struct SaveChosenSelectionUseCase {
    private let selectionStorage: SelectionStorage

    init(selectionStorage: SelectionStorage = SelectionStorage()) {
        self.selectionStorage = selectionStorage
    }

    func saveChosenSelection(_ chosen: FamilyActivitySelection, ruleId: String) -> String {
        guard let current = selectionStorage.loadSelection(ruleId: ruleId) else {
            return saveFirstSelection(chosen, ruleId: ruleId)
        }
        let change = SelectionChange(
            from: SelectionSnapshot(selection: current),
            to: SelectionSnapshot(selection: chosen)
        )
        selectionStorage.saveSelection(current.unioned(with: chosen), ruleId: ruleId)
        if change.removesAnything {
            selectionStorage.savePendingSelection(chosen, ruleId: ruleId)
            return "removalPending"
        }
        selectionStorage.clearPendingSelection(ruleId: ruleId)
        return "saved"
    }

    private func saveFirstSelection(_ chosen: FamilyActivitySelection, ruleId: String) -> String {
        if SelectionSnapshot(selection: chosen).isEmpty { return "cancelled" }
        selectionStorage.saveSelection(chosen, ruleId: ruleId)
        return "saved"
    }
}
