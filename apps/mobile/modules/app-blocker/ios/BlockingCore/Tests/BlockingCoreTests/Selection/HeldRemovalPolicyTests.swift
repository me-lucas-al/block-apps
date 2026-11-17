import Foundation
import XCTest
@testable import BlockingCore

final class HeldRemovalPolicyTests: XCTestCase {
    private let effectiveAt: Date = Date(timeIntervalSince1970: 1_000)

    private func decide(
        holdEffectiveAt: Date?,
        hasPendingServerChange: Bool = false,
        serverNow: Date?
    ) -> HeldRemovalDecision {
        return HeldRemovalPolicy.decide(
            holdEffectiveAt: holdEffectiveAt,
            hasPendingServerChange: hasPendingServerChange,
            serverNow: serverNow
        )
    }

    func testRemovalWithoutAHoldIsKept() {
        let later: Date = Date(timeIntervalSince1970: 5_000)
        XCTAssertEqual(decide(holdEffectiveAt: nil, serverNow: later), .keep)
    }

    func testRemovalWhoseServerChangeIsStillPendingIsKept() {
        let later: Date = Date(timeIntervalSince1970: 5_000)
        let decision: HeldRemovalDecision = decide(
            holdEffectiveAt: effectiveAt,
            hasPendingServerChange: true,
            serverNow: later
        )
        XCTAssertEqual(decision, .keep)
    }

    func testRemovalIsKeptWithoutServerTime() {
        XCTAssertEqual(decide(holdEffectiveAt: effectiveAt, serverNow: nil), .keep)
    }

    func testRemovalIsCommittedOnceServerTimeReachedTheCooldownEnd() {
        XCTAssertEqual(decide(holdEffectiveAt: effectiveAt, serverNow: effectiveAt), .commit)
    }

    func testRemovalIsCommittedWhenTheServerClockIsOneSecondBehindBecauseOfTruncation() {
        let truncatedServerNow: Date = effectiveAt.addingTimeInterval(-0.9)
        XCTAssertEqual(decide(holdEffectiveAt: effectiveAt, serverNow: truncatedServerNow), .commit)
    }

    func testRemovalIsCommittedExactlyAtTheToleranceLimit() {
        XCTAssertEqual(decide(holdEffectiveAt: effectiveAt, serverNow: effectiveAt.addingTimeInterval(-1)), .commit)
    }

    func testRemovalIsDiscardedJustBeyondTheTolerance() {
        XCTAssertEqual(decide(holdEffectiveAt: effectiveAt, serverNow: effectiveAt.addingTimeInterval(-1.1)), .discard)
    }

    func testRemovalIsDiscardedWhenTheChangeVanishedBeforeTheCooldownEnded() {
        let earlier: Date = Date(timeIntervalSince1970: 500)
        XCTAssertEqual(decide(holdEffectiveAt: effectiveAt, serverNow: earlier), .discard)
    }

    func testIsoInstantParserReadsInstantsWithAndWithoutFractionalSeconds() {
        let withFraction: Date? = IsoInstantParser.parse("2026-11-16T12:00:00.000Z")
        let withoutFraction: Date? = IsoInstantParser.parse("2026-11-16T12:00:00Z")
        XCTAssertNotNil(withFraction)
        XCTAssertEqual(withFraction, withoutFraction)
        XCTAssertNil(IsoInstantParser.parse("not a date"))
    }
}
