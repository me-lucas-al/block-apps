import XCTest
@testable import BlockingCore

final class RulesOwnershipPolicyTests: XCTestCase {
    func testTheFirstAccountToInstallRulesIsAccepted() {
        let decision = RulesOwnershipPolicy.decide(storedOwnerId: nil, incomingOwnerId: "a", hasStoredRules: true)
        XCTAssertEqual(decision, .accept)
    }

    func testTheSameAccountMayReplaceItsRules() {
        let decision = RulesOwnershipPolicy.decide(storedOwnerId: "a", incomingOwnerId: "a", hasStoredRules: true)
        XCTAssertEqual(decision, .accept)
    }

    func testAnotherAccountCannotReplaceRulesThatAreStillInForce() {
        let decision = RulesOwnershipPolicy.decide(storedOwnerId: "a", incomingOwnerId: "b", hasStoredRules: true)
        XCTAssertEqual(decision, .rejectBecauseAnotherAccountOwnsTheRules)
    }

    func testAnotherAccountMayTakeOverOnceTheOwnerHasNoRulesLeft() {
        let decision = RulesOwnershipPolicy.decide(storedOwnerId: "a", incomingOwnerId: "b", hasStoredRules: false)
        XCTAssertEqual(decision, .accept)
    }
}
