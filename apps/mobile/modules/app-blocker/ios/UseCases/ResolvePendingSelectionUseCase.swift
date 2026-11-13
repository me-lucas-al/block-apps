struct ResolvePendingSelectionUseCase {
    private let selectionStorage: SelectionStorage

    init(selectionStorage: SelectionStorage = SelectionStorage()) {
        self.selectionStorage = selectionStorage
    }

    func hasPendingSelection(ruleId: String) -> Bool {
        return selectionStorage.loadPendingSelection(ruleId: ruleId) != nil
    }

    func commitPendingSelection(ruleId: String) {
        guard let pending = selectionStorage.loadPendingSelection(ruleId: ruleId) else { return }
        selectionStorage.saveSelection(pending, ruleId: ruleId)
        selectionStorage.clearPendingSelection(ruleId: ruleId)
    }

    func discardPendingSelection(ruleId: String) {
        selectionStorage.clearPendingSelection(ruleId: ruleId)
    }
}
