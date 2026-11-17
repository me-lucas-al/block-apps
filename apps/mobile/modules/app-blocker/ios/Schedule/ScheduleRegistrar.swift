import DeviceActivity
import Foundation

struct ScheduleRegistrar {
    private let activityCenter = DeviceActivityCenter()

    func registerActivities(of plan: ShieldSchedulePlan) throws {
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
