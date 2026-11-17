import FamilyControls

struct CommitPendingSelectionUseCase {
    private let selectionStorage: SelectionStorage

    init(selectionStorage: SelectionStorage = SelectionStorage()) {
        self.selectionStorage = selectionStorage
    }

    func commitPendingSelection(ruleId: String) throws {
        let pendingSelection: FamilyActivitySelection? = selectionStorage.loadPendingSelection(ruleId: ruleId)
        guard let pending: FamilyActivitySelection = pendingSelection else { return }
        try selectionStorage.saveSelection(pending, ruleId: ruleId)
        selectionStorage.clearPendingSelection(ruleId: ruleId)
    }
}
