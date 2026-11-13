import XCTest
@testable import BlockingCore

final class RuleEvaluatorTests: XCTestCase {
    private let monday = 1
    private let friday = 5
    private let saturday = 6
    private let sunday = 0

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
        let rule = BlockingRule(
            id: "rule", kind: .site, target: "example.com", alwaysBlocked: true, windows: []
        )
        XCTAssertTrue(isBlocked(rule, monday, minutes(12)))
    }

    func testScheduledWithoutWindowsIsBlocked() {
        XCTAssertTrue(isBlocked(scheduled(), monday, minutes(12)))
    }

    func testInsideAllowedWindowIsNotBlocked() {
        let rule = scheduled(TimeWindow(days: [monday], startMinute: minutes(18), endMinute: minutes(20)))
        XCTAssertFalse(isBlocked(rule, monday, minutes(19)))
    }

    func testStartIsAllowedAndEndIsBlocked() {
        let rule = scheduled(TimeWindow(days: [monday], startMinute: minutes(18), endMinute: minutes(20)))
        XCTAssertFalse(isBlocked(rule, monday, minutes(18)))
        XCTAssertTrue(isBlocked(rule, monday, minutes(20)))
    }

    func testOtherDaysAreBlocked() {
        let rule = scheduled(TimeWindow(days: [monday], startMinute: minutes(18), endMinute: minutes(20)))
        XCTAssertTrue(isBlocked(rule, friday, minutes(19)))
    }

    func testWindowCrossingMidnightAllowsBothParts() {
        let rule = scheduled(TimeWindow(days: [friday], startMinute: minutes(22), endMinute: minutes(2)))
        XCTAssertFalse(isBlocked(rule, friday, minutes(23)))
        XCTAssertFalse(isBlocked(rule, saturday, minutes(1)))
        XCTAssertTrue(isBlocked(rule, friday, minutes(1)))
        XCTAssertTrue(isBlocked(rule, saturday, minutes(2)))
    }

    func testWindowCrossingMidnightWrapsFromSaturdayToSunday() {
        let rule = scheduled(TimeWindow(days: [saturday], startMinute: minutes(23), endMinute: minutes(1)))
        XCTAssertFalse(isBlocked(rule, sunday, minutes(0, 30)))
    }

    func testZeroLengthWindowNeverAllows() {
        let rule = scheduled(TimeWindow(days: [monday], startMinute: minutes(10), endMinute: minutes(10)))
        XCTAssertTrue(isBlocked(rule, monday, minutes(10)))
    }

    func testMomentOverloadReadsDayAndMinute() {
        let rule = scheduled(TimeWindow(days: [monday], startMinute: minutes(18), endMinute: minutes(20)))
        let insideWindow = WeekMoment(dayOfWeek: monday, minuteOfDay: minutes(19))
        XCTAssertFalse(RuleEvaluator.isBlocked(rule, at: insideWindow))
    }
}
