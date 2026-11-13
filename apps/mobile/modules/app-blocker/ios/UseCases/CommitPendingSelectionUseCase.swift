struct CommitPendingSelectionUseCase {
    private let selectionStorage: SelectionStorage

    init(selectionStorage: SelectionStorage = SelectionStorage()) {
        self.selectionStorage = selectionStorage
    }

    func commitPendingSelection(ruleId: String) {
        guard let pending = selectionStorage.loadPendingSelection(ruleId: ruleId) else { return }
        selectionStorage.saveSelection(pending, ruleId: ruleId)
        selectionStorage.clearPendingSelection(ruleId: ruleId)
    }
}
