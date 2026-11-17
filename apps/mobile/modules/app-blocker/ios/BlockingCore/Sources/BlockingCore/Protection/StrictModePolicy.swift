import Foundation

public enum StrictModePolicy {
    public static let denyAppRemovalTarget = "ios-deny-app-removal"
    public static let maximumDaysWithoutOpeningTheApp = 14

    public static func isDenyAppRemovalRequired(
        by rules: [BlockingRule],
        lastAppOpenedAt: Date?,
        now: Date
    ) -> Bool {
        guard rules.contains(where: isDenyAppRemovalRule) else { return false }
        guard let lastAppOpenedAt = lastAppOpenedAt else { return true }
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
