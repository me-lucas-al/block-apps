import FamilyControls
import Foundation

struct SelectionStorage {
    private let defaults: UserDefaults

    init(defaults: UserDefaults = SharedDefaults.makeAppGroupDefaults()) {
        self.defaults = defaults
    }

    func loadSelection(ruleId: String) -> FamilyActivitySelection? {
        return load(key: selectionKey(ruleId))
    }

    func saveSelection(_ selection: FamilyActivitySelection, ruleId: String) {
        save(selection, key: selectionKey(ruleId))
    }

    func loadPendingSelection(ruleId: String) -> FamilyActivitySelection? {
        return load(key: pendingKey(ruleId))
    }

    func savePendingSelection(_ selection: FamilyActivitySelection, ruleId: String) {
        save(selection, key: pendingKey(ruleId))
    }

    func clearPendingSelection(ruleId: String) {
        defaults.removeObject(forKey: pendingKey(ruleId))
    }

    private func selectionKey(_ ruleId: String) -> String {
        return "selection.\(ruleId)"
    }

    private func pendingKey(_ ruleId: String) -> String {
        return "pendingSelection.\(ruleId)"
    }

    private func load(key: String) -> FamilyActivitySelection? {
        guard let encoded = defaults.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(FamilyActivitySelection.self, from: encoded)
    }

    private func save(_ selection: FamilyActivitySelection, key: String) {
        guard let encoded = try? JSONEncoder().encode(selection) else { return }
        defaults.set(encoded, forKey: key)
    }
}
