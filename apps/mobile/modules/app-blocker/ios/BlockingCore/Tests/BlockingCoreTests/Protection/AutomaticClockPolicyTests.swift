import XCTest
@testable import BlockingCore

final class AutomaticClockPolicyTests: XCTestCase {
    private func rule(kind: TargetKind, target: String, alwaysBlocked: Bool, windows: [TimeWindow]) -> BlockingRule {
        return BlockingRule(id: "r", kind: kind, target: target, alwaysBlocked: alwaysBlocked, windows: windows)
    }

    func testNoRulesDoNotNeedTheAutomaticClock() {
        XCTAssertFalse(AutomaticClockPolicy.isAutomaticDateAndTimeRequired(by: [], hasAcceptedStrictMode: true))
    }

    func testRuleWithTimeWindowsNeedsTheAutomaticClock() {
        let window: TimeWindow = TimeWindow(days: [1], startMinute: 600, endMinute: 700)
        let scheduled: BlockingRule = rule(kind: .iosSelection, target: "a", alwaysBlocked: false, windows: [window])
        XCTAssertTrue(AutomaticClockPolicy.isAutomaticDateAndTimeRequired(by: [scheduled], hasAcceptedStrictMode: true))
    }

    func testStrictModeNeedsTheAutomaticClock() {
        let strict: BlockingRule = rule(
            kind: .protection,
            target: StrictModePolicy.denyAppRemovalTarget,
            alwaysBlocked: true,
            windows: []
        )
        XCTAssertTrue(AutomaticClockPolicy.isAutomaticDateAndTimeRequired(by: [strict], hasAcceptedStrictMode: true))
    }

    func testStrictModeWithoutAcceptanceDoesNotNeedTheAutomaticClock() {
        let strict: BlockingRule = rule(
            kind: .protection,
            target: StrictModePolicy.denyAppRemovalTarget,
            alwaysBlocked: true,
            windows: []
        )
        XCTAssertFalse(AutomaticClockPolicy.isAutomaticDateAndTimeRequired(by: [strict], hasAcceptedStrictMode: false))
    }

    func testAlwaysBlockedSiteDoesNotNeedTheAutomaticClock() {
        let site: BlockingRule = rule(kind: .site, target: "x.com", alwaysBlocked: true, windows: [])
        XCTAssertFalse(AutomaticClockPolicy.isAutomaticDateAndTimeRequired(by: [site], hasAcceptedStrictMode: true))
    }
}
