import XCTest
@testable import BlockingCore

final class SelectionLimitsTests: XCTestCase {
    func testFiftyItemsStayWithinTheReportedLimit() {
        XCTAssertFalse(SelectionLimits.exceedsReportedLimit(itemCount: 50))
    }

    func testMoreThanFiftyItemsExceedTheReportedLimit() {
        XCTAssertTrue(SelectionLimits.exceedsReportedLimit(itemCount: 51))
    }
}
