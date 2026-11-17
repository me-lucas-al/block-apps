import XCTest
@testable import BlockingCore

final class SelectionChangeTests: XCTestCase {
    private func selection(
        apps: Set<String> = [],
        categories: Set<String> = [],
        domains: Set<String> = []
    ) -> SelectionSnapshot {
        return SelectionSnapshot(applications: apps, categories: categories, webDomains: domains)
    }

    func testAddingOnlyIsAppliedNowAndRemovesNothing() {
        let change: SelectionChange = SelectionChange(from: selection(apps: ["a"]), to: selection(apps: ["a", "b"]))
        XCTAssertFalse(change.removesAnything)
        XCTAssertEqual(change.added, selection(apps: ["b"]))
        XCTAssertEqual(change.appliedNow, selection(apps: ["a", "b"]))
    }

    func testRemovingAnAppIsDetectedAndKeptBlockedUntilCooldown() {
        let change: SelectionChange = SelectionChange(from: selection(apps: ["a", "b"]), to: selection(apps: ["a"]))
        XCTAssertTrue(change.removesAnything)
        XCTAssertEqual(change.removed, selection(apps: ["b"]))
        XCTAssertEqual(change.appliedNow, selection(apps: ["a", "b"]))
    }

    func testRemovingACategoryOrDomainCountsAsRemoval() {
        let current: SelectionSnapshot = selection(categories: ["social"], domains: ["x.com"])
        XCTAssertTrue(SelectionChange(from: current, to: selection(domains: ["x.com"])).removesAnything)
        XCTAssertTrue(SelectionChange(from: current, to: selection(categories: ["social"])).removesAnything)
    }

    func testSwappingAppsAddsNowAndHoldsTheRemoval() {
        let change: SelectionChange = SelectionChange(from: selection(apps: ["a"]), to: selection(apps: ["b"]))
        XCTAssertTrue(change.removesAnything)
        XCTAssertEqual(change.appliedNow, selection(apps: ["a", "b"]))
    }

    func testIdenticalSelectionsChangeNothing() {
        let current: SelectionSnapshot = selection(apps: ["a"], categories: ["c"], domains: ["d"])
        let change: SelectionChange = SelectionChange(from: current, to: current)
        XCTAssertFalse(change.removesAnything)
        XCTAssertTrue(change.added.isEmpty)
    }
}
