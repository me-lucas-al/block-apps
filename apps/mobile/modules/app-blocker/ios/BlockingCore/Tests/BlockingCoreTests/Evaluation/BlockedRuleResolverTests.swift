import XCTest
@testable import BlockingCore

final class BlockedRuleResolverTests: XCTestCase {
    private let mondayEvening: WeekMoment = WeekMoment(dayOfWeek: 1, minuteOfDay: 19 * 60)

    private func scheduledRule(_ id: String, kind: TargetKind = .iosSelection, days: Set<Int> = [1]) -> BlockingRule {
        let window: TimeWindow = TimeWindow(days: days, startMinute: 18 * 60, endMinute: 20 * 60)
        return BlockingRule(id: id, kind: kind, target: id, alwaysBlocked: false, windows: [window])
    }

    private func blockedIds(_ rules: [BlockingRule], at moment: WeekMoment) -> [String] {
        return BlockedRuleResolver.resolveBlockedRules(rules, at: moment).map { $0.id }
    }

    func testRuleInsideAllowedWindowIsNotBlocked() {
        XCTAssertEqual(blockedIds([scheduledRule("a")], at: mondayEvening), [])
    }

    func testRuleOutsideAllowedWindowIsBlocked() {
        let earlier: WeekMoment = WeekMoment(dayOfWeek: 1, minuteOfDay: 10 * 60)
        XCTAssertEqual(blockedIds([scheduledRule("a")], at: earlier), ["a"])
    }

    func testAlwaysBlockedRuleIsBlocked() {
        let rule: BlockingRule = BlockingRule(id: "s", kind: .site, target: "x.com", alwaysBlocked: true, windows: [])
        XCTAssertEqual(blockedIds([rule], at: mondayEvening), ["s"])
    }

    func testRulesNotEnforcedOnIosAreNeverReturned() {
        let keyword: BlockingRule = scheduledRule("k", kind: .keyword)
        let protection: BlockingRule = BlockingRule(
            id: "p",
            kind: .protection,
            target: "p",
            alwaysBlocked: true,
            windows: []
        )
        XCTAssertEqual(blockedIds([keyword, protection], at: WeekMoment(dayOfWeek: 3, minuteOfDay: 0)), [])
    }

    func testRuleBeyondTheActivityLimitStaysBlockedInsideItsWindow() {
        let allDays: Set<Int> = [0, 1, 2, 3, 4, 5, 6]
        let fillers: [BlockingRule] = (0..<10).map { (index: Int) -> BlockingRule in
            let start: Int = 10 + index * 60
            let window: TimeWindow = TimeWindow(days: allDays, startMinute: start, endMinute: start + 30)
            return BlockingRule(id: "f\(index)", kind: .iosSelection, target: "f", alwaysBlocked: false, windows: [window])
        }
        let overflowing: BlockingRule = BlockingRule(
            id: "overflows",
            kind: .iosSelection,
            target: "overflows",
            alwaysBlocked: false,
            windows: [TimeWindow(days: allDays, startMinute: 8 * 60, endMinute: 9 * 60 + 30)]
        )
        let mondayMorning: WeekMoment = WeekMoment(dayOfWeek: 1, minuteOfDay: 8 * 60 + 30)
        XCTAssertEqual(blockedIds(fillers + [overflowing], at: mondayMorning).last, "overflows")
    }
}
