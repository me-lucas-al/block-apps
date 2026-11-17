import FamilyControls

struct SaveChosenSelectionUseCase {
    private let selectionStorage: SelectionStorage

    init(selectionStorage: SelectionStorage = SelectionStorage()) {
        self.selectionStorage = selectionStorage
    }

    func saveChosenSelection(_ chosen: FamilyActivitySelection, ruleId: String) throws -> ChooseAppsOutcome {
        guard let current: FamilyActivitySelection = selectionStorage.loadSelection(ruleId: ruleId) else {
            return try saveFirstSelection(chosen, ruleId: ruleId)
        }
        let change: SelectionChange = SelectionChange(
            from: SelectionSnapshot(selection: current),
            to: SelectionSnapshot(selection: chosen)
        )
        if change.removesAnything {
            try selectionStorage.savePendingSelection(chosen, ruleId: ruleId)
            try selectionStorage.saveSelection(current.unioned(with: chosen), ruleId: ruleId)
            return .removalPending
        }
        try selectionStorage.saveSelection(current.unioned(with: chosen), ruleId: ruleId)
        selectionStorage.clearPendingSelection(ruleId: ruleId)
        return .saved
    }

    private func saveFirstSelection(_ chosen: FamilyActivitySelection, ruleId: String) throws -> ChooseAppsOutcome {
        if SelectionSnapshot(selection: chosen).isEmpty { return .cancelled }
        try selectionStorage.saveSelection(chosen, ruleId: ruleId)
        return .saved
    }
}
