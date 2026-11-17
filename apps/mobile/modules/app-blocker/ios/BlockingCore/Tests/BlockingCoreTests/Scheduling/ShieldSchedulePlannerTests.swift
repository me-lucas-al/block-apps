import XCTest
@testable import BlockingCore

final class ShieldSchedulePlannerTests: XCTestCase {
    private func scheduledRule(
        _ id: String,
        _ windows: TimeWindow...,
        kind: TargetKind = .iosSelection
    ) -> BlockingRule {
        return BlockingRule(id: id, kind: kind, target: id, alwaysBlocked: false, windows: windows)
    }

    private func activityNames(_ plan: ShieldSchedulePlan) -> [String] {
        return plan.activities.map { $0.name }
    }

    func testAlwaysBlockedRulesNeedNoActivities() {
        let rule: BlockingRule = BlockingRule(id: "a", kind: .site, target: "a.com", alwaysBlocked: true, windows: [])
        XCTAssertEqual(ShieldSchedulePlanner.plan(rules: [rule]).activities, [])
    }

    func testWindowProducesStartAndEndActivities() {
        let rule: BlockingRule = scheduledRule("a", TimeWindow(days: [1], startMinute: 18 * 60, endMinute: 20 * 60))
        let plan: ShieldSchedulePlan = ShieldSchedulePlanner.plan(rules: [rule])
        XCTAssertEqual(activityNames(plan), ["tick-1080", "tick-1200"])
        XCTAssertEqual(plan.unscheduledRuleIds, [])
    }

    func testActivityUsesMinuteOfDayAndMinimumInterval() {
        let rule: BlockingRule = scheduledRule("a", TimeWindow(days: [1], startMinute: 18 * 60, endMinute: 20 * 60))
        let first: PlannedActivity = ShieldSchedulePlanner.plan(rules: [rule]).activities[0]
        XCTAssertEqual(first, PlannedActivity(name: "tick-1080", startMinute: 1080, endMinute: 1095))
    }

    func testActivityNearMidnightWrapsAroundTheDay() {
        let lateWindow: TimeWindow = TimeWindow(days: [1], startMinute: 23 * 60 + 50, endMinute: 23 * 60 + 55)
        let first: PlannedActivity = ShieldSchedulePlanner.plan(rules: [scheduledRule("a", lateWindow)]).activities[0]
        XCTAssertEqual(first.startMinute, 23 * 60 + 50)
        XCTAssertEqual(first.endMinute, 5)
    }

    func testWindowCrossingMidnightUsesItsStartAndEndMinutes() {
        let rule: BlockingRule = scheduledRule("a", TimeWindow(days: [5], startMinute: 22 * 60, endMinute: 2 * 60))
        XCTAssertEqual(activityNames(ShieldSchedulePlanner.plan(rules: [rule])), ["tick-120", "tick-1320"])
    }

    func testWindowEndingAtMidnightUsesMinuteZero() {
        let rule: BlockingRule = scheduledRule("a", TimeWindow(days: [6], startMinute: 22 * 60, endMinute: 0))
        XCTAssertEqual(activityNames(ShieldSchedulePlanner.plan(rules: [rule])), ["tick-0", "tick-1320"])
    }

    func testZeroLengthWindowProducesNothing() {
        let rule: BlockingRule = scheduledRule("a", TimeWindow(days: [1], startMinute: 600, endMinute: 600))
        XCTAssertEqual(ShieldSchedulePlanner.plan(rules: [rule]).activities, [])
    }

    func testSharedBoundariesAreDeduplicatedAcrossRules() {
        let first: BlockingRule = scheduledRule("a", TimeWindow(days: [1], startMinute: 600, endMinute: 700))
        let second: BlockingRule = scheduledRule("b", TimeWindow(days: [1], startMinute: 600, endMinute: 800))
        let plan: ShieldSchedulePlan = ShieldSchedulePlanner.plan(rules: [first, second])
        XCTAssertEqual(activityNames(plan), ["tick-600", "tick-700", "tick-800"])
    }

    func testRulesBeyondTheLimitStayUnscheduled() {
        let first: BlockingRule = scheduledRule("a", TimeWindow(days: [1], startMinute: 600, endMinute: 700))
        let second: BlockingRule = scheduledRule("b", TimeWindow(days: [1], startMinute: 800, endMinute: 900))
        let plan: ShieldSchedulePlan = ShieldSchedulePlanner.plan(rules: [first, second], maxActivities: 3)
        XCTAssertEqual(plan.unscheduledRuleIds, ["b"])
        XCTAssertEqual(plan.activities.count, 2)
    }

    func testRulesNotEnforcedOnIosAreIgnored() {
        let morningWindow: TimeWindow = TimeWindow(days: [1], startMinute: 600, endMinute: 700)
        let rule: BlockingRule = scheduledRule("k", morningWindow, kind: .keyword)
        XCTAssertEqual(ShieldSchedulePlanner.plan(rules: [rule]).activities, [])
    }
}
