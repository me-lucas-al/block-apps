import Foundation

struct StrictModeAcceptanceStorage {
    private let acceptedKey: String = "strictMode.acceptedOnThisDevice"
    private let defaults: UserDefaults?

    init(defaults: UserDefaults? = SharedDefaults.makeAppGroupDefaults()) {
        self.defaults = defaults
    }

    func saveAcceptedOnThisDevice() throws {
        try SharedDefaults.requireDefaults(defaults).set(true, forKey: acceptedKey)
    }

    func clearAcceptedOnThisDevice() {
        defaults?.removeObject(forKey: acceptedKey)
    }

    func loadHasAcceptedOnThisDevice() -> Bool {
        return defaults?.bool(forKey: acceptedKey) ?? false
    }
}
