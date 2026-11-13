import Foundation

enum SharedDefaults {
    static func makeAppGroupDefaults() -> UserDefaults? {
        return UserDefaults(suiteName: AppGroupIdentifier.shared)
    }
}
