import XCTest
@testable import BlockingCore

final class LegacyOwnerMigrationTests: XCTestCase {
    func testAnOwnerStoredAsTheEmailIsReplacedByTheSub() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "a@b.c")
        try storage.migrateToSubOne()
        XCTAssertEqual(storage.ownerId, "sub-1")
    }

    func testAnotherAccountsOwnerIsLeftAlone() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "other@b.c")
        try storage.migrateToSubOne()
        XCTAssertEqual(storage.ownerId, "other@b.c")
        XCTAssertTrue(storage.savedOwnerIds.isEmpty)
    }

    func testNothingIsWrittenWhenTheOwnerIsAlreadyTheSub() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "sub-1")
        try storage.migrateToSubOne()
        XCTAssertTrue(storage.savedOwnerIds.isEmpty)
    }

    func testNothingIsWrittenWhenThereIsNoLegacyOwnerId() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "a@b.c")
        try storage.migrateToSubOne(legacyOwnerId: nil)
        XCTAssertEqual(storage.ownerId, "a@b.c")
        XCTAssertTrue(storage.savedOwnerIds.isEmpty)
    }

    func testAFailureToSaveIsReportedInsteadOfSwallowed() {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "a@b.c")
        storage.failsToSave = true
        XCTAssertThrowsError(try storage.migrateToSubOne())
        XCTAssertEqual(storage.ownerId, "a@b.c")
    }
}
