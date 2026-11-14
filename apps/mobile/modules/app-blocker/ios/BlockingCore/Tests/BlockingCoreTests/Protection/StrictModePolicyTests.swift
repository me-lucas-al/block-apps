import XCTest
@testable import BlockingCore

final class StrictModePolicyTests: XCTestCase {
    private let now = Date(timeIntervalSince1970: 1_800_000_000)
    private let oneDay: TimeInterval = 24 * 60 * 60

    private func protectionRule(
        target: String = StrictModePolicy.denyAppRemovalTarget,
        alwaysBlocked: Bool = true,
        kind: TargetKind = .protection
    ) -> BlockingRule {
        return BlockingRule(id: "p", kind: kind, target: target, alwaysBlocked: alwaysBlocked, windows: [])
    }

    private func isRequired(_ rules: [BlockingRule], lastOpenedDaysAgo: Double? = 0) -> Bool {
        let lastOpened = lastOpenedDaysAgo.map { now.addingTimeInterval(-$0 * oneDay) }
        return StrictModePolicy.isDenyAppRemovalRequired(by: rules, lastAppOpenedAt: lastOpened, now: now)
    }

    func testNoRulesMeansAppsCanBeRemoved() {
        XCTAssertFalse(isRequired([]))
    }

    func testAlwaysOnProtectionRuleDeniesAppRemoval() {
        XCTAssertTrue(isRequired([protectionRule()]))
    }

    func testScheduledProtectionRuleIsIgnored() {
        XCTAssertFalse(isRequired([protectionRule(alwaysBlocked: false)]))
    }

    func testUnknownProtectionTargetIsIgnored() {
        XCTAssertFalse(isRequired([protectionRule(target: "other")]))
    }

    func testSameTargetOnAnotherKindIsIgnored() {
        XCTAssertFalse(isRequired([protectionRule(kind: .site)]))
    }

    func testProtectionRulesAreNotShieldedAsContent() {
        let rule = protectionRule()
        XCTAssertFalse(rule.kind.isEnforcedOnIos)
        XCTAssertTrue(BlockedRuleResolver.resolveBlockedRules([rule], at: WeekMoment(dayOfWeek: 1, minuteOfDay: 0)).isEmpty)
    }

    func testTheLockHoldsWhileTheAppWasOpenedRecently() {
        XCTAssertTrue(isRequired([protectionRule()], lastOpenedDaysAgo: 13))
    }

    func testTheLockReleasesWhenTheAppWasNotOpenedForTooLong() {
        XCTAssertFalse(isRequired([protectionRule()], lastOpenedDaysAgo: 15))
    }

    func testTheLockHoldsWhenTheAppNeverRecordedAnOpening() {
        XCTAssertTrue(isRequired([protectionRule()], lastOpenedDaysAgo: nil))
    }

    func testAnOpeningInTheFutureKeepsTheLock() {
        XCTAssertTrue(isRequired([protectionRule()], lastOpenedDaysAgo: -2))
    }
}
