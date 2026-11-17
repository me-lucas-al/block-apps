struct HoldPendingSelectionUseCase {
    private let selectionStorage: SelectionStorage
    private let ownershipGuard: RulesOwnershipGuard

    init(
        selectionStorage: SelectionStorage = SelectionStorage(),
        ownershipGuard: RulesOwnershipGuard = RulesOwnershipGuard()
    ) {
        self.selectionStorage = selectionStorage
        self.ownershipGuard = ownershipGuard
    }

    func holdPendingSelection(ruleId: String, effectiveAtIso: String, ownerId: String) throws {
        try ownershipGuard.requireOwnership(byOwnerId: ownerId)
        selectionStorage.holdPendingSelection(ruleId: ruleId, effectiveAtIso: effectiveAtIso)
    }
}
