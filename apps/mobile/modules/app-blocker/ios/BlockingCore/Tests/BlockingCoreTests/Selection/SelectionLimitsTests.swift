import XCTest
@testable import BlockingCore

final class SelectionLimitsTests: XCTestCase {
    func testFiftyApplicationsStayWithinTheReportedLimit() {
        XCTAssertFalse(SelectionLimits.exceedsReportedApplicationLimit(applicationCount: 50))
    }

    func testMoreThanFiftyApplicationsExceedTheReportedLimit() {
        XCTAssertTrue(SelectionLimits.exceedsReportedApplicationLimit(applicationCount: 51))
    }
}
