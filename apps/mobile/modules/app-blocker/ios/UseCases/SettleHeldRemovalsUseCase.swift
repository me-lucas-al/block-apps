import Foundation

struct SettleHeldRemovalsUseCase {
    private let selectionStorage: SelectionStorage
    private let commitPendingSelection: CommitPendingSelectionUseCase
    private let discardPendingSelection: DiscardPendingSelectionUseCase

    init(
        selectionStorage: SelectionStorage = SelectionStorage(),
        commitPendingSelection: CommitPendingSelectionUseCase = CommitPendingSelectionUseCase(),
        discardPendingSelection: DiscardPendingSelectionUseCase = DiscardPendingSelectionUseCase()
    ) {
        self.selectionStorage = selectionStorage
        self.commitPendingSelection = commitPendingSelection
        self.discardPendingSelection = discardPendingSelection
    }

    func settleHeldRemovals(ruleIds: [String], pendingRuleIds: Set<String>, serverNowIso: String?) {
        let serverNow: Date? = serverNowIso.flatMap { (iso: String) -> Date? in IsoInstantParser.parse(iso) }
        for ruleId: String in ruleIds {
            guard selectionStorage.loadPendingSelection(ruleId: ruleId) != nil else { continue }
            let holdText: String? = selectionStorage.loadPendingSelectionHold(ruleId: ruleId)
            let decision: HeldRemovalDecision = HeldRemovalPolicy.decide(
                holdEffectiveAt: holdText.flatMap { (text: String) -> Date? in IsoInstantParser.parse(text) },
                hasPendingServerChange: pendingRuleIds.contains(ruleId),
                serverNow: serverNow
            )
            apply(decision, ruleId: ruleId)
        }
    }

    private func commitHeldRemoval(ruleId: String) {
        do {
            try commitPendingSelection.commitPendingSelection(ruleId: ruleId)
        } catch {
            let reason: String = String(describing: error)
            AppLogger.selection.error("Held removal of \(ruleId, privacy: .public) failed: \(reason, privacy: .public)")
        }
    }

    private func apply(_ decision: HeldRemovalDecision, ruleId: String) {
        switch decision {
        case .commit: commitHeldRemoval(ruleId: ruleId)
        case .discard: discardPendingSelection.discardPendingSelection(ruleId: ruleId)
        case .keep: break
        }
    }
}
