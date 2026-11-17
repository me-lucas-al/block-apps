import FamilyControls
import Foundation

struct SelectionStorage {
    private let defaults: UserDefaults?

    init(defaults: UserDefaults? = SharedDefaults.makeAppGroupDefaults()) {
        self.defaults = defaults
    }

    func loadSelection(ruleId: String) -> FamilyActivitySelection? {
        return load(key: selectionKey(ruleId))
    }

    func hasNonEmptySelection(ruleId: String) -> Bool {
        guard let selection: FamilyActivitySelection = loadSelection(ruleId: ruleId) else { return false }
        return !SelectionSnapshot(selection: selection).isEmpty
    }

    func saveSelection(_ selection: FamilyActivitySelection, ruleId: String) {
        save(selection, key: selectionKey(ruleId))
    }

    func loadPendingSelection(ruleId: String) -> FamilyActivitySelection? {
        return load(key: pendingKey(ruleId))
    }

    func savePendingSelection(_ selection: FamilyActivitySelection, ruleId: String) {
        clearPendingSelection(ruleId: ruleId)
        save(selection, key: pendingKey(ruleId))
    }

    func clearPendingSelection(ruleId: String) {
        defaults?.removeObject(forKey: pendingKey(ruleId))
        defaults?.removeObject(forKey: holdKey(ruleId))
    }

    func holdPendingSelection(ruleId: String, effectiveAtIso: String) {
        guard loadPendingSelection(ruleId: ruleId) != nil else { return }
        defaults?.set(effectiveAtIso, forKey: holdKey(ruleId))
    }

    func loadPendingSelectionHold(ruleId: String) -> String? {
        return defaults?.string(forKey: holdKey(ruleId))
    }

    private func selectionKey(_ ruleId: String) -> String {
        return "selection." + ruleId
    }

    private func pendingKey(_ ruleId: String) -> String {
        return "pendingSelection." + ruleId
    }

    private func holdKey(_ ruleId: String) -> String {
        return "pendingSelectionHold." + ruleId
    }

    private func load(key: String) -> FamilyActivitySelection? {
        guard let encoded: Data = defaults?.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(FamilyActivitySelection.self, from: encoded)
    }

    private func save(_ selection: FamilyActivitySelection, key: String) {
        guard let encoded: Data = try? JSONEncoder().encode(selection) else { return }
        defaults?.set(encoded, forKey: key)
    }
}
