import DeviceActivity
import Foundation

struct ScheduleRegistrar {
    private let registeredNamesKey = "schedule.registeredActivityNames"
    private let activityCenter = DeviceActivityCenter()
    private let defaults: UserDefaults?

    init(defaults: UserDefaults? = SharedDefaults.makeAppGroupDefaults()) {
        self.defaults = defaults
    }

    func registerActivities(of plan: ShieldSchedulePlan) throws {
        let plannedNames = plan.activities.map { $0.name }
        let registeredNames = defaults?.stringArray(forKey: registeredNamesKey)
        if registeredNames == plannedNames { return }

        defaults?.removeObject(forKey: registeredNamesKey)
        activityCenter.stopMonitoring()
        var firstFailure: Error?
        for activity in plan.activities {
            do {
                try activityCenter.startMonitoring(
                    DeviceActivityName(activity.name),
                    during: makeSchedule(for: activity)
                )
            } catch {
                firstFailure = firstFailure ?? error
            }
        }
        if let firstFailure = firstFailure { throw firstFailure }
        defaults?.set(plannedNames, forKey: registeredNamesKey)
    }

    private func makeSchedule(for activity: PlannedActivity) -> DeviceActivitySchedule {
        return DeviceActivitySchedule(
            intervalStart: DateComponents(
                hour: activity.startMinute / 60,
                minute: activity.startMinute % 60,
                weekday: activity.weekday
            ),
            intervalEnd: DateComponents(
                hour: activity.endMinute / 60,
                minute: activity.endMinute % 60
            ),
            repeats: true
        )
    }
}
