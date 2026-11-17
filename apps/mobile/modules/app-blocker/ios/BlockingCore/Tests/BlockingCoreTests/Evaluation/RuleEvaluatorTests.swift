import XCTest
@testable import BlockingCore

final class RuleEvaluatorTests: XCTestCase {
    private let monday: Int = 1
    private let friday: Int = 5
    private let saturday: Int = 6
    private let sunday: Int = 0

    private func minutes(_ hours: Int, _ minutes: Int = 0) -> Int {
        return hours * 60 + minutes
    }

    private func scheduled(_ windows: TimeWindow...) -> BlockingRule {
        return BlockingRule(
            id: "rule", kind: .iosSelection, target: "group", alwaysBlocked: false, windows: windows
        )
    }

    private func isBlocked(_ rule: BlockingRule, _ day: Int, _ minute: Int) -> Bool {
        return RuleEvaluator.isBlocked(rule, dayOfWeek: day, minuteOfDay: minute)
    }

    func testAlwaysModeIsAlwaysBlocked() {
        let rule: BlockingRule = BlockingRule(
            id: "rule", kind: .site, target: "example.com", alwaysBlocked: true, windows: []
        )
        XCTAssertTrue(isBlocked(rule, monday, minutes(12)))
    }

    func testScheduledWithoutWindowsIsBlocked() {
        XCTAssertTrue(isBlocked(scheduled(), monday, minutes(12)))
    }

    func testInsideAllowedWindowIsNotBlocked() {
        let rule: BlockingRule = scheduled(TimeWindow(days: [monday], startMinute: minutes(18), endMinute: minutes(20)))
        XCTAssertFalse(isBlocked(rule, monday, minutes(19)))
    }

    func testStartIsAllowedAndEndIsBlocked() {
        let rule: BlockingRule = scheduled(TimeWindow(days: [monday], startMinute: minutes(18), endMinute: minutes(20)))
        XCTAssertFalse(isBlocked(rule, monday, minutes(18)))
        XCTAssertTrue(isBlocked(rule, monday, minutes(20)))
    }

    func testOtherDaysAreBlocked() {
        let rule: BlockingRule = scheduled(TimeWindow(days: [monday], startMinute: minutes(18), endMinute: minutes(20)))
        XCTAssertTrue(isBlocked(rule, friday, minutes(19)))
    }

    func testWindowCrossingMidnightAllowsBothParts() {
        let rule: BlockingRule = scheduled(TimeWindow(days: [friday], startMinute: minutes(22), endMinute: minutes(2)))
        XCTAssertFalse(isBlocked(rule, friday, minutes(23)))
        XCTAssertFalse(isBlocked(rule, saturday, minutes(1)))
        XCTAssertTrue(isBlocked(rule, friday, minutes(1)))
        XCTAssertTrue(isBlocked(rule, saturday, minutes(2)))
    }

    func testWindowCrossingMidnightWrapsFromSaturdayToSunday() {
        let rule: BlockingRule = scheduled(
            TimeWindow(days: [saturday], startMinute: minutes(23), endMinute: minutes(1))
        )
        XCTAssertFalse(isBlocked(rule, sunday, minutes(0, 30)))
    }

    func testZeroLengthWindowNeverAllows() {
        let rule: BlockingRule = scheduled(TimeWindow(days: [monday], startMinute: minutes(10), endMinute: minutes(10)))
        XCTAssertTrue(isBlocked(rule, monday, minutes(10)))
    }

    func testMomentOverloadReadsDayAndMinute() {
        let rule: BlockingRule = scheduled(TimeWindow(days: [monday], startMinute: minutes(18), endMinute: minutes(20)))
        let insideWindow: WeekMoment = WeekMoment(dayOfWeek: monday, minuteOfDay: minutes(19))
        XCTAssertFalse(RuleEvaluator.isBlocked(rule, at: insideWindow))
    }
}
