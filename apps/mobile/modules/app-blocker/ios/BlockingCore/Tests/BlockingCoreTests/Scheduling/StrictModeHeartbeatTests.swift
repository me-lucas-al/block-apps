import XCTest
@testable import BlockingCore

final class StrictModeHeartbeatTests: XCTestCase {
    private let strictRule: BlockingRule = BlockingRule(
        id: "strict",
        kind: .protection,
        target: StrictModePolicy.denyAppRemovalTarget,
        alwaysBlocked: true,
        windows: []
    )

    private func scheduledRule(_ id: String, startMinute: Int, endMinute: Int) -> BlockingRule {
        let window: TimeWindow = TimeWindow(days: [0, 1, 2, 3, 4, 5, 6], startMinute: startMinute, endMinute: endMinute)
        return BlockingRule(id: id, kind: .iosSelection, target: id, alwaysBlocked: false, windows: [window])
    }

    func testStrictModeAddsADailyHeartbeatActivity() {
        let plan: ShieldSchedulePlan = ShieldSchedulePlanner.plan(rules: [strictRule])
        XCTAssertEqual(plan.activities.map { $0.name }, [ShieldSchedulePlanner.strictModeHeartbeatName])
        XCTAssertEqual(plan.activities[0].startMinute, ShieldSchedulePlanner.strictModeHeartbeatStartMinute)
    }

    func testNoStrictModeMeansNoHeartbeat() {
        let rule: BlockingRule = scheduledRule("a", startMinute: 600, endMinute: 700)
        let plan: ShieldSchedulePlan = ShieldSchedulePlanner.plan(rules: [rule])
        XCTAssertFalse(plan.activities.map { $0.name }.contains(ShieldSchedulePlanner.strictModeHeartbeatName))
    }

    func testTheHeartbeatReservesOneOfTheTwentyActivities() {
        let tenRules: [BlockingRule] = (0..<10).map { (index: Int) -> BlockingRule in
            scheduledRule("r\(index)", startMinute: index * 100, endMinute: index * 100 + 50)
        }
        let plan: ShieldSchedulePlan = ShieldSchedulePlanner.plan(rules: tenRules + [strictRule])
        XCTAssertEqual(plan.unscheduledRuleIds, ["r9"])
        XCTAssertEqual(plan.activities.count, 19)
    }
}
