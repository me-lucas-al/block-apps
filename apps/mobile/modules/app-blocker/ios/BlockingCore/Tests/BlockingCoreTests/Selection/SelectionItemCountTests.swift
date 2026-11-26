import XCTest
@testable import BlockingCore

final class SelectionItemCountTests: XCTestCase {
    func testAnEmptySelectionHasNoItems() {
        let itemCount: Int = SelectionItemCount.total(applications: 0, categories: 0, webDomains: 0)
        XCTAssertEqual(itemCount, 0)
    }

    func testApplicationsCategoriesAndWebDomainsAreAllCounted() {
        let itemCount: Int = SelectionItemCount.total(applications: 3, categories: 2, webDomains: 4)
        XCTAssertEqual(itemCount, 9)
    }

    func testEachKindAloneCountsTowardTheTotal() {
        XCTAssertEqual(SelectionItemCount.total(applications: 5, categories: 0, webDomains: 0), 5)
        XCTAssertEqual(SelectionItemCount.total(applications: 0, categories: 5, webDomains: 0), 5)
        XCTAssertEqual(SelectionItemCount.total(applications: 0, categories: 0, webDomains: 5), 5)
    }
}
