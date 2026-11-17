import FamilyControls

struct CommitPendingSelectionUseCase {
    private let selectionStorage: SelectionStorage

    init(selectionStorage: SelectionStorage = SelectionStorage()) {
        self.selectionStorage = selectionStorage
    }

    func commitPendingSelection(ruleId: String) {
        let pendingSelection: FamilyActivitySelection? = selectionStorage.loadPendingSelection(ruleId: ruleId)
        guard let pending: FamilyActivitySelection = pendingSelection else { return }
        selectionStorage.saveSelection(pending, ruleId: ruleId)
        selectionStorage.clearPendingSelection(ruleId: ruleId)
    }
}
