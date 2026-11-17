import XCTest
@testable import BlockingCore

final class LegacyOwnerPolicyTests: XCTestCase {
    private func shouldMigrate(stored: String?, legacy: String?, incoming: String = "sub-1") -> Bool {
        return LegacyOwnerPolicy.shouldMigrate(
            storedOwnerId: stored,
            legacyOwnerId: legacy,
            incomingOwnerId: incoming
        )
    }

    func testAnOwnerStoredAsTheAccountEmailMigratesToTheSub() {
        XCTAssertTrue(shouldMigrate(stored: "a@b.c", legacy: "a@b.c"))
    }

    func testAnotherAccountsEmailDoesNotMigrate() {
        XCTAssertFalse(shouldMigrate(stored: "other@b.c", legacy: "a@b.c"))
    }

    func testNothingStoredOrNoLegacyIdDoesNotMigrate() {
        XCTAssertFalse(shouldMigrate(stored: nil, legacy: "a@b.c"))
        XCTAssertFalse(shouldMigrate(stored: "a@b.c", legacy: nil))
    }

    func testAnOwnerAlreadyStoredAsTheSubDoesNotMigrate() {
        XCTAssertFalse(shouldMigrate(stored: "sub-1", legacy: "sub-1"))
    }
}
