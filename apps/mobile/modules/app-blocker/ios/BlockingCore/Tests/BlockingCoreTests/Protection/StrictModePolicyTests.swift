import XCTest
@testable import BlockingCore

final class StrictModePolicyTests: XCTestCase {
    private func protectionRule(
        target: String = StrictModePolicy.denyAppRemovalTarget,
        alwaysBlocked: Bool = true,
        kind: TargetKind = .protection
    ) -> BlockingRule {
        return BlockingRule(id: "p", kind: kind, target: target, alwaysBlocked: alwaysBlocked, windows: [])
    }

    func testNoRulesMeansAppsCanBeRemoved() {
        XCTAssertFalse(StrictModePolicy.isDenyAppRemovalRequired(by: []))
    }

    func testAlwaysOnProtectionRuleDeniesAppRemoval() {
        XCTAssertTrue(StrictModePolicy.isDenyAppRemovalRequired(by: [protectionRule()]))
    }

    func testScheduledProtectionRuleIsIgnored() {
        XCTAssertFalse(StrictModePolicy.isDenyAppRemovalRequired(by: [protectionRule(alwaysBlocked: false)]))
    }

    func testUnknownProtectionTargetIsIgnored() {
        XCTAssertFalse(StrictModePolicy.isDenyAppRemovalRequired(by: [protectionRule(target: "other")]))
    }

    func testSameTargetOnAnotherKindIsIgnored() {
        XCTAssertFalse(StrictModePolicy.isDenyAppRemovalRequired(by: [protectionRule(kind: .site)]))
    }

    func testProtectionRulesAreNotShieldedAsContent() {
        let rule = protectionRule()
        XCTAssertFalse(rule.kind.isEnforcedOnIos)
        XCTAssertTrue(BlockedRuleResolver.resolveBlockedRules([rule], at: WeekMoment(dayOfWeek: 1, minuteOfDay: 0)).isEmpty)
    }
}
