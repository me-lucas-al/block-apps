import FamilyControls
import Foundation

struct SelectionStorage {
    private let defaults: UserDefaults?

    init(defaults: UserDefaults? = SharedDefaults.makeAppGroupDefaults()) {
        self.defaults = defaults
    }

    func loadSelectionResult(ruleId: String) -> SelectionLoadResult {
        return load(key: selectionKey(ruleId))
    }

    func loadSelection(ruleId: String) -> FamilyActivitySelection? {
        return loadSelectionResult(ruleId: ruleId).selection
    }

    func hasNonEmptySelection(ruleId: String) -> Bool {
        guard let selection: FamilyActivitySelection = loadSelection(ruleId: ruleId) else { return false }
        let hasAnyToken: Bool = !selection.applicationTokens.isEmpty
            || !selection.categoryTokens.isEmpty
            || !selection.webDomainTokens.isEmpty
        return hasAnyToken
    }

    func saveSelection(_ selection: FamilyActivitySelection, ruleId: String) throws {
        try save(selection, key: selectionKey(ruleId))
    }

    func loadPendingSelection(ruleId: String) -> FamilyActivitySelection? {
        return load(key: pendingKey(ruleId)).selection
    }

    func savePendingSelection(_ selection: FamilyActivitySelection, ruleId: String) throws {
        clearPendingSelection(ruleId: ruleId)
        try save(selection, key: pendingKey(ruleId))
    }

    func clearPendingSelection(ruleId: String) {
        defaults?.removeObject(forKey: pendingKey(ruleId))
        defaults?.removeObject(forKey: holdKey(ruleId))
    }

    func holdPendingSelection(ruleId: String, effectiveAtIso: String) throws {
        let appGroup: UserDefaults = try SharedDefaults.requireDefaults(defaults)
        guard loadPendingSelection(ruleId: ruleId) != nil else { return }
        appGroup.set(effectiveAtIso, forKey: holdKey(ruleId))
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

    private func load(key: String) -> SelectionLoadResult {
        guard let encoded: Data = defaults?.data(forKey: key) else { return .absent }
        do {
            return .found(try JSONDecoder().decode(FamilyActivitySelection.self, from: encoded))
        } catch {
            let reason: String = String(describing: error)
            AppLogger.selection.error("\(key, privacy: .public) unreadable: \(reason, privacy: .private)")
            return .unreadable
        }
    }

    private func save(_ selection: FamilyActivitySelection, key: String) throws {
        let appGroup: UserDefaults = try SharedDefaults.requireDefaults(defaults)
        do {
            appGroup.set(try JSONEncoder().encode(selection), forKey: key)
        } catch {
            let reason: String = String(describing: error)
            AppLogger.selection.error("\(key, privacy: .public) not saved: \(reason, privacy: .private)")
            throw SharedStorageError.selectionNotSaved
        }
    }
}
