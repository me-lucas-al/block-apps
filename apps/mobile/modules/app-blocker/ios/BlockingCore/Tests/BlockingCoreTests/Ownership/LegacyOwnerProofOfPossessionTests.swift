import XCTest
@testable import BlockingCore

final class LegacyOwnerProofOfPossessionTests: XCTestCase {
    func testAReusedEmailWithNoRuleInCommonKeepsTheOldOwner() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "a@b.c")
        try storage.migrateToSubOne(incomingRuleIds: ["rule-9"])
        XCTAssertEqual(storage.ownerId, "a@b.c")
        XCTAssertTrue(storage.savedOwnerIds.isEmpty)
    }

    func testAReusedEmailSyncingAnEmptyListKeepsTheOldOwner() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "a@b.c")
        try storage.migrateToSubOne(incomingRuleIds: [])
        XCTAssertEqual(storage.ownerId, "a@b.c")
        XCTAssertTrue(storage.savedOwnerIds.isEmpty)
    }

    func testARuleInCommonProvesPossessionAndMigrates() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "a@b.c", storedRuleIds: ["rule-1", "rule-2"])
        try storage.migrateToSubOne(incomingRuleIds: ["rule-2"])
        XCTAssertEqual(storage.ownerId, "sub-1")
    }

    func testADeviceWithoutStoredRulesMigratesFreely() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "a@b.c", storedRuleIds: [])
        try storage.migrateToSubOne(incomingRuleIds: [])
        XCTAssertEqual(storage.ownerId, "sub-1")
    }

    func testUnreadableStoredRulesKeepTheOldOwner() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "a@b.c", storedRuleIds: nil)
        try storage.migrateToSubOne()
        XCTAssertEqual(storage.ownerId, "a@b.c")
    }
}
