struct DiscardPendingSelectionUseCase {
    private let selectionStorage: SelectionStorage

    init(selectionStorage: SelectionStorage = SelectionStorage()) {
        self.selectionStorage = selectionStorage
    }

    func discardPendingSelection(ruleId: String) {
        selectionStorage.clearPendingSelection(ruleId: ruleId)
    }
}
