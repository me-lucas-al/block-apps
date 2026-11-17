import XCTest
@testable import BlockingCore

final class StrictModePolicyTests: XCTestCase {
    private let now: Date = Date(timeIntervalSince1970: 1_800_000_000)
    private let oneDay: TimeInterval = 24 * 60 * 60

    private func protectionRule(
        target: String = StrictModePolicy.denyAppRemovalTarget,
        alwaysBlocked: Bool = true,
        kind: TargetKind = .protection
    ) -> BlockingRule {
        return BlockingRule(id: "p", kind: kind, target: target, alwaysBlocked: alwaysBlocked, windows: [])
    }

    private func isRequired(
        _ rules: [BlockingRule],
        lastOpenedDaysAgo: Double? = 0,
        accepted: Bool = true
    ) -> Bool {
        let lastOpened: Date? = lastOpenedDaysAgo.map { now.addingTimeInterval(-$0 * oneDay) }
        return StrictModePolicy.isDenyAppRemovalRequired(
            by: rules,
            lastAppOpenedAt: lastOpened,
            now: now,
            hasAcceptedOnThisDevice: accepted
        )
    }

    func testNoRulesMeansAppsCanBeRemoved() {
        XCTAssertFalse(isRequired([]))
    }

    func testAlwaysOnProtectionRuleDeniesAppRemoval() {
        XCTAssertTrue(isRequired([protectionRule()]))
    }

    func testTheLockStaysOffUntilThisDeviceAcceptedTheWarning() {
        XCTAssertFalse(isRequired([protectionRule()], accepted: false))
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
        let rule: BlockingRule = protectionRule()
        XCTAssertFalse(rule.kind.isEnforcedOnIos)
        let mondayMidnight: WeekMoment = WeekMoment(dayOfWeek: 1, minuteOfDay: 0)
        XCTAssertTrue(BlockedRuleResolver.resolveBlockedRules([rule], at: mondayMidnight).isEmpty)
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
