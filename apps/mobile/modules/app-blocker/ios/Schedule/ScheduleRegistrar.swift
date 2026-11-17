import DeviceActivity
import Foundation

struct ScheduleRegistrar {
    private static let layoutVersion: Int = 3
    private let layoutVersionKey: String = "schedule.layoutVersion"
    private let activityCenter: DeviceActivityCenter = DeviceActivityCenter()
    private let defaults: UserDefaults?
    private let statusStorage: ScheduleStatusStorage

    init(
        defaults: UserDefaults? = SharedDefaults.makeAppGroupDefaults(),
        statusStorage: ScheduleStatusStorage = ScheduleStatusStorage()
    ) {
        self.defaults = defaults
        self.statusStorage = statusStorage
    }

    func registerActivities(of plan: ShieldSchedulePlan) throws {
        if isAlreadyMonitoring(plan) { return }

        defaults?.removeObject(forKey: layoutVersionKey)
        statusStorage.saveIsIncomplete(true)
        activityCenter.stopMonitoring()
        var firstFailure: Error?
        for activity: PlannedActivity in plan.activities {
            do {
                try activityCenter.startMonitoring(
                    DeviceActivityName(activity.name),
                    during: makeSchedule(for: activity)
                )
            } catch {
                firstFailure = firstFailure ?? error
            }
        }
        if let firstFailure: Error = firstFailure { throw firstFailure }
        statusStorage.saveIsIncomplete(false)
        defaults?.set(Self.layoutVersion, forKey: layoutVersionKey)
    }

    private func isAlreadyMonitoring(_ plan: ShieldSchedulePlan) -> Bool {
        if defaults?.integer(forKey: layoutVersionKey) != Self.layoutVersion { return false }
        let monitoredNames: Set<String> = Set(activityCenter.activities.map { $0.rawValue })
        return monitoredNames == Set(plan.activities.map { $0.name })
    }

    private func makeSchedule(for activity: PlannedActivity) -> DeviceActivitySchedule {
        return DeviceActivitySchedule(
            intervalStart: DateComponents(hour: activity.startMinute / 60, minute: activity.startMinute % 60),
            intervalEnd: DateComponents(hour: activity.endMinute / 60, minute: activity.endMinute % 60),
            repeats: true
        )
    }
}
