import XCTest
@testable import BlockingCore

final class ShieldScheduleDailyRepeatTests: XCTestCase {
    private let everyDay: Set<Int> = [0, 1, 2, 3, 4, 5, 6]

    private func scheduledRule(_ id: String, days: Set<Int>, startMinute: Int, endMinute: Int) -> BlockingRule {
        let window: TimeWindow = TimeWindow(days: days, startMinute: startMinute, endMinute: endMinute)
        return BlockingRule(id: id, kind: .iosSelection, target: id, alwaysBlocked: false, windows: [window])
    }

    func testManyDailyRulesFitInTheActivityLimit() {
        let rules: [BlockingRule] = (0..<10).map { (index: Int) -> BlockingRule in
            scheduledRule("r\(index)", days: everyDay, startMinute: index * 100, endMinute: index * 100 + 50)
        }
        let plan: ShieldSchedulePlan = ShieldSchedulePlanner.plan(rules: rules)
        XCTAssertEqual(plan.activities.count, 20)
        XCTAssertEqual(plan.unscheduledRuleIds, [])
    }

    func testSameTimeOnDifferentDaysIsOneActivity() {
        let monday: BlockingRule = scheduledRule("a", days: [1], startMinute: 600, endMinute: 700)
        let friday: BlockingRule = scheduledRule("b", days: [5], startMinute: 600, endMinute: 700)
        XCTAssertEqual(ShieldSchedulePlanner.plan(rules: [monday, friday]).activities.count, 2)
    }

    func testTheEleventhDailyRuleBeyondTheLimitStaysUnscheduled() {
        let rules: [BlockingRule] = (0..<11).map { (index: Int) -> BlockingRule in
            scheduledRule("r\(index)", days: everyDay, startMinute: index * 100, endMinute: index * 100 + 50)
        }
        XCTAssertEqual(ShieldSchedulePlanner.plan(rules: rules).unscheduledRuleIds, ["r10"])
    }

    func testIncompleteScheduleBlocksEveryRuleWithTimeWindows() {
        let rule: BlockingRule = scheduledRule("a", days: [1], startMinute: 600, endMinute: 700)
        let insideWindow: WeekMoment = WeekMoment(dayOfWeek: 1, minuteOfDay: 650)
        let blocked: [BlockingRule] = BlockedRuleResolver.resolveBlockedRules(
            [rule],
            at: insideWindow,
            isScheduleIncomplete: true
        )
        XCTAssertEqual(blocked.map { $0.id }, ["a"])
    }
}
