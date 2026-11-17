import Foundation

enum SharedDefaults {
    static func makeAppGroupDefaults() -> UserDefaults? {
        let defaults: UserDefaults? = UserDefaults(suiteName: AppGroupIdentifier.shared)
        if defaults == nil {
            AppLogger.storage.error("App Group \(AppGroupIdentifier.shared, privacy: .public) is unavailable")
        }
        return defaults
    }

    static func requireDefaults(_ defaults: UserDefaults?) throws -> UserDefaults {
        guard let defaults: UserDefaults = defaults else { throw SharedStorageError.appGroupUnavailable }
        return defaults
    }
}
