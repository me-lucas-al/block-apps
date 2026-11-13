import XCTest
@testable import BlockingCore

final class ShieldSchedulePlannerTests: XCTestCase {
    private func scheduledRule(_ id: String, _ windows: TimeWindow..., kind: TargetKind = .iosSelection) -> BlockingRule {
        return BlockingRule(id: id, kind: kind, target: id, alwaysBlocked: false, windows: windows)
    }

    private func triggerNames(_ plan: ShieldSchedulePlan) -> [String] {
        return plan.activities.map { $0.name }
    }

    func testAlwaysBlockedRulesNeedNoActivities() {
        let rule = BlockingRule(id: "a", kind: .site, target: "a.com", alwaysBlocked: true, windows: [])
        XCTAssertEqual(ShieldSchedulePlanner.plan(rules: [rule]).activities, [])
    }

    func testWindowProducesStartAndEndActivities() {
        let rule = scheduledRule("a", TimeWindow(days: [1], startMinute: 18 * 60, endMinute: 20 * 60))
        let plan = ShieldSchedulePlanner.plan(rules: [rule])
        XCTAssertEqual(triggerNames(plan), ["tick-1-1080", "tick-1-1200"])
        XCTAssertEqual(plan.unscheduledRuleIds, [])
    }

    func testActivityUsesCalendarWeekdayAndMinimumInterval() {
        let rule = scheduledRule("a", TimeWindow(days: [1], startMinute: 18 * 60, endMinute: 20 * 60))
        let first = ShieldSchedulePlanner.plan(rules: [rule]).activities[0]
        XCTAssertEqual(first, PlannedActivity(name: "tick-1-1080", weekday: 2, startMinute: 1080, endMinute: 1095))
    }

    func testIntervalNearMidnightWrapsAroundTheDay() {
        let rule = scheduledRule("a", TimeWindow(days: [1], startMinute: 23 * 60 + 50, endMinute: 23 * 60 + 55))
        let first = ShieldSchedulePlanner.plan(rules: [rule]).activities[0]
        XCTAssertEqual(first.endMinute, 5)
    }

    func testWindowCrossingMidnightIsCutAndSharesTheMidnightActivity() {
        let rule = scheduledRule("a", TimeWindow(days: [5], startMinute: 22 * 60, endMinute: 2 * 60))
        let plan = ShieldSchedulePlanner.plan(rules: [rule])
        XCTAssertEqual(triggerNames(plan), ["tick-5-1320", "tick-6-0", "tick-6-120"])
    }

    func testWindowEndingAtMidnightMovesEndToNextDay() {
        let rule = scheduledRule("a", TimeWindow(days: [6], startMinute: 22 * 60, endMinute: 0))
        let plan = ShieldSchedulePlanner.plan(rules: [rule])
        XCTAssertEqual(triggerNames(plan), ["tick-0-0", "tick-6-1320"])
    }

    func testZeroLengthWindowProducesNothing() {
        let rule = scheduledRule("a", TimeWindow(days: [1], startMinute: 600, endMinute: 600))
        XCTAssertEqual(ShieldSchedulePlanner.plan(rules: [rule]).activities, [])
    }

    func testSharedBoundariesAreDeduplicatedAcrossRules() {
        let first = scheduledRule("a", TimeWindow(days: [1], startMinute: 600, endMinute: 700))
        let second = scheduledRule("b", TimeWindow(days: [1], startMinute: 600, endMinute: 800))
        let plan = ShieldSchedulePlanner.plan(rules: [first, second])
        XCTAssertEqual(triggerNames(plan), ["tick-1-600", "tick-1-700", "tick-1-800"])
    }

    func testRulesBeyondTheLimitStayUnscheduled() {
        let first = scheduledRule("a", TimeWindow(days: [1, 2], startMinute: 600, endMinute: 700))
        let second = scheduledRule("b", TimeWindow(days: [3], startMinute: 600, endMinute: 700))
        let plan = ShieldSchedulePlanner.plan(rules: [first, second], maxActivities: 4)
        XCTAssertEqual(plan.unscheduledRuleIds, ["b"])
        XCTAssertEqual(plan.activities.count, 4)
    }

    func testDefaultLimitIsTwenty() {
        let days: Set<Int> = [0, 1, 2, 3, 4, 5, 6]
        let big = scheduledRule("big", TimeWindow(days: days, startMinute: 600, endMinute: 700))
        let extra = scheduledRule("extra", TimeWindow(days: days, startMinute: 800, endMinute: 900))
        let plan = ShieldSchedulePlanner.plan(rules: [big, extra])
        XCTAssertEqual(plan.activities.count, 14)
        XCTAssertEqual(plan.unscheduledRuleIds, ["extra"])
    }

    func testRulesNotEnforcedOnIosAreIgnored() {
        let rule = scheduledRule("k", TimeWindow(days: [1], startMinute: 600, endMinute: 700), kind: .keyword)
        XCTAssertEqual(ShieldSchedulePlanner.plan(rules: [rule]).activities, [])
    }
}
