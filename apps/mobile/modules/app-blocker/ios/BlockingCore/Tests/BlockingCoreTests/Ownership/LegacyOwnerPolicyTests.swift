import XCTest
@testable import BlockingCore

final class LegacyOwnerPolicyTests: XCTestCase {
    private func shouldMigrate(
        stored: String?,
        legacy: String?,
        incoming: String = "sub-1",
        storedRuleIds: Set<String>? = ["rule-1"],
        incomingRuleIds: Set<String> = ["rule-1"]
    ) -> Bool {
        return LegacyOwnerPolicy.shouldMigrate(
            storedOwnerId: stored,
            legacyOwnerId: legacy,
            incomingOwnerId: incoming,
            storedRuleIds: storedRuleIds,
            incomingRuleIds: incomingRuleIds
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

    func testAReusedEmailWithNoRuleInCommonDoesNotMigrate() {
        XCTAssertFalse(shouldMigrate(stored: "a@b.c", legacy: "a@b.c", incomingRuleIds: ["rule-9"]))
    }

    func testAReusedEmailSyncingAnEmptyListDoesNotMigrate() {
        XCTAssertFalse(shouldMigrate(stored: "a@b.c", legacy: "a@b.c", incomingRuleIds: []))
    }

    func testOneRuleInCommonIsEnoughToMigrate() {
        XCTAssertTrue(
            shouldMigrate(
                stored: "a@b.c",
                legacy: "a@b.c",
                storedRuleIds: ["rule-1", "rule-2"],
                incomingRuleIds: ["rule-2", "rule-3"]
            )
        )
    }

    func testADeviceWithoutStoredRulesMigratesFreely() {
        XCTAssertTrue(shouldMigrate(stored: "a@b.c", legacy: "a@b.c", storedRuleIds: [], incomingRuleIds: []))
    }

    func testUnreadableStoredRulesDoNotMigrate() {
        XCTAssertFalse(shouldMigrate(stored: "a@b.c", legacy: "a@b.c", storedRuleIds: nil))
    }
}
