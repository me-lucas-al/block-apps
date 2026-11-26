import XCTest
@testable import BlockingCore

final class GroupLimitReportTests: XCTestCase {
    func testGroupsWithinTheLimitAreNotOversized() {
        let report: GroupLimitReport = GroupLimitReport(
            ruleIds: ["a", "b"],
            itemCountsByRuleId: ["a": 50, "b": 0]
        )
        XCTAssertEqual(report.oversizedRuleIds, [])
    }

    func testOnlyTheGroupAboveTheLimitIsOversized() {
        let report: GroupLimitReport = GroupLimitReport(
            ruleIds: ["a", "b", "c"],
            itemCountsByRuleId: ["a": 51, "b": 10, "c": 50]
        )
        XCTAssertEqual(report.oversizedRuleIds, ["a"])
    }

    func testAGroupWithoutAStoredSelectionCountsAsZero() {
        let report: GroupLimitReport = GroupLimitReport(ruleIds: ["a", "missing"], itemCountsByRuleId: ["a": 3])
        XCTAssertEqual(report.oversizedRuleIds, [])
        XCTAssertFalse(report.isTotalOverLimit)
    }

    func testTheTotalAtTheLimitIsNotOver() {
        let report: GroupLimitReport = GroupLimitReport(
            ruleIds: ["a", "b"],
            itemCountsByRuleId: ["a": 30, "b": 20]
        )
        XCTAssertFalse(report.isTotalOverLimit)
    }

    func testTheTotalAboveTheLimitIsOverEvenWhenNoGroupIsOversized() {
        let report: GroupLimitReport = GroupLimitReport(
            ruleIds: ["a", "b"],
            itemCountsByRuleId: ["a": 30, "b": 21]
        )
        XCTAssertTrue(report.isTotalOverLimit)
        XCTAssertEqual(report.oversizedRuleIds, [])
    }

    func testCountsOfGroupsThatAreNotListedDoNotEnterTheTotal() {
        let report: GroupLimitReport = GroupLimitReport(
            ruleIds: ["a"],
            itemCountsByRuleId: ["a": 10, "removed": 60]
        )
        XCTAssertFalse(report.isTotalOverLimit)
        XCTAssertEqual(report.oversizedRuleIds, [])
    }

    func testNoGroupsMeansNoWarning() {
        let report: GroupLimitReport = GroupLimitReport(ruleIds: [], itemCountsByRuleId: [:])
        XCTAssertEqual(report.oversizedRuleIds, [])
        XCTAssertFalse(report.isTotalOverLimit)
    }
}
