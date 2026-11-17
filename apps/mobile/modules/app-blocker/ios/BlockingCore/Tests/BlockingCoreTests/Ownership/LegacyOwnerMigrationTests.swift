import XCTest
@testable import BlockingCore

final class LegacyOwnerMigrationTests: XCTestCase {
    private final class FakeOwnerStorage: OwnerStoring {
        var ownerId: String?
        var savedOwnerIds: [String] = []
        var failsToSave: Bool = false

        init(ownerId: String?) {
            self.ownerId = ownerId
        }

        func loadOwnerId() -> String? {
            return ownerId
        }

        func saveOwnerId(_ ownerId: String) throws {
            if failsToSave { throw RuleParsingError.malformedDocument }
            self.ownerId = ownerId
            savedOwnerIds.append(ownerId)
        }
    }

    func testAnOwnerStoredAsTheEmailIsReplacedByTheSub() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "a@b.c")
        try LegacyOwnerMigration.migrate(storage: storage, legacyOwnerId: "a@b.c", incomingOwnerId: "sub-1")
        XCTAssertEqual(storage.ownerId, "sub-1")
    }

    func testAnotherAccountsOwnerIsLeftAlone() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "other@b.c")
        try LegacyOwnerMigration.migrate(storage: storage, legacyOwnerId: "a@b.c", incomingOwnerId: "sub-1")
        XCTAssertEqual(storage.ownerId, "other@b.c")
        XCTAssertTrue(storage.savedOwnerIds.isEmpty)
    }

    func testNothingIsWrittenWhenTheOwnerIsAlreadyTheSub() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "sub-1")
        try LegacyOwnerMigration.migrate(storage: storage, legacyOwnerId: "a@b.c", incomingOwnerId: "sub-1")
        XCTAssertTrue(storage.savedOwnerIds.isEmpty)
    }

    func testNothingIsWrittenWhenThereIsNoLegacyOwnerId() throws {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "a@b.c")
        try LegacyOwnerMigration.migrate(storage: storage, legacyOwnerId: nil, incomingOwnerId: "sub-1")
        XCTAssertEqual(storage.ownerId, "a@b.c")
        XCTAssertTrue(storage.savedOwnerIds.isEmpty)
    }

    func testAFailureToSaveIsReportedInsteadOfSwallowed() {
        let storage: FakeOwnerStorage = FakeOwnerStorage(ownerId: "a@b.c")
        storage.failsToSave = true
        XCTAssertThrowsError(
            try LegacyOwnerMigration.migrate(storage: storage, legacyOwnerId: "a@b.c", incomingOwnerId: "sub-1")
        )
        XCTAssertEqual(storage.ownerId, "a@b.c")
    }
}
