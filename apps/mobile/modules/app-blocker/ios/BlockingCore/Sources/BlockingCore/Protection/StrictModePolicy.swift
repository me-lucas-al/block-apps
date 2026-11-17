import Foundation

public enum StrictModePolicy {
    public static let denyAppRemovalTarget: String = "ios-deny-app-removal"
    public static let maximumDaysWithoutOpeningTheApp: Int = 14

    public static func hasStrictModeRule(in rules: [BlockingRule]) -> Bool {
        return rules.contains(where: isDenyAppRemovalRule)
    }

    public static func isDenyAppRemovalRequired(
        by rules: [BlockingRule],
        lastAppOpenedAt: Date?,
        now: Date,
        hasAcceptedOnThisDevice: Bool
    ) -> Bool {
        guard hasAcceptedOnThisDevice else { return false }
        guard hasStrictModeRule(in: rules) else { return false }
        guard let lastAppOpenedAt: Date = lastAppOpenedAt else { return true }
        return now.timeIntervalSince(lastAppOpenedAt) <= maximumTimeWithoutOpeningTheApp
    }

    private static var maximumTimeWithoutOpeningTheApp: TimeInterval {
        return TimeInterval(maximumDaysWithoutOpeningTheApp) * 24 * 60 * 60
    }

    private static func isDenyAppRemovalRule(_ rule: BlockingRule) -> Bool {
        return rule.kind == .protection
            && rule.target == denyAppRemovalTarget
            && rule.alwaysBlocked
    }
}
