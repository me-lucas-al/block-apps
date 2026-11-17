import Foundation

struct ScheduleStatusStorage {
    private let incompleteKey: String = "schedule.incomplete"
    private let defaults: UserDefaults?

    init(defaults: UserDefaults? = SharedDefaults.makeAppGroupDefaults()) {
        self.defaults = defaults
    }

    func saveIsIncomplete(_ isIncomplete: Bool) {
        defaults?.set(isIncomplete, forKey: incompleteKey)
    }

    func loadIsIncomplete() -> Bool {
        return defaults?.bool(forKey: incompleteKey) ?? false
    }
}
