import Foundation

struct AppActivityStorage {
    private let lastOpenedKey = "app.lastOpenedAt"
    private let defaults: UserDefaults?

    init(defaults: UserDefaults? = SharedDefaults.makeAppGroupDefaults()) {
        self.defaults = defaults
    }

    func recordAppOpened(at date: Date) {
        defaults?.set(date.timeIntervalSince1970, forKey: lastOpenedKey)
    }

    func loadLastAppOpenedAt() -> Date? {
        guard let seconds = defaults?.object(forKey: lastOpenedKey) as? Double else { return nil }
        return Date(timeIntervalSince1970: seconds)
    }
}
