import XCTest
@testable import BlockingCore

final class ShieldScheduleEndWeekdayTests: XCTestCase {
    private func firstActivity(day: Int, startMinute: Int, endMinute: Int) -> PlannedActivity {
        let window: TimeWindow = TimeWindow(days: [day], startMinute: startMinute, endMinute: endMinute)
        let rule: BlockingRule = BlockingRule(
            id: "a",
            kind: .iosSelection,
            target: "a",
            alwaysBlocked: false,
            windows: [window]
        )
        return ShieldSchedulePlanner.plan(rules: [rule]).activities[0]
    }

    func testActivityInsideTheDayEndsOnTheSameWeekday() {
        let activity: PlannedActivity = firstActivity(day: 1, startMinute: 600, endMinute: 700)
        XCTAssertEqual(activity.weekday, 2)
        XCTAssertEqual(activity.endWeekday, 2)
    }

    func testActivityCrossingMidnightEndsOnTheNextWeekday() {
        let activity: PlannedActivity = firstActivity(day: 1, startMinute: 23 * 60 + 50, endMinute: 23 * 60 + 55)
        XCTAssertEqual(activity.endMinute, 5)
        XCTAssertEqual(activity.weekday, 2)
        XCTAssertEqual(activity.endWeekday, 3)
    }

    func testIntervalNearMidnightOnSaturdayEndsOnSunday() {
        let activity: PlannedActivity = firstActivity(day: 6, startMinute: 23 * 60 + 50, endMinute: 23 * 60 + 55)
        XCTAssertEqual(activity.weekday, 7)
        XCTAssertEqual(activity.endWeekday, 1)
    }

    func testIntervalEndingExactlyAtMidnightEndsOnTheNextDay() {
        let activity: PlannedActivity = firstActivity(day: 2, startMinute: 23 * 60 + 45, endMinute: 23 * 60 + 50)
        XCTAssertEqual(activity.endMinute, 0)
        XCTAssertEqual(activity.endWeekday, 4)
    }
}
