public enum StrictModePolicy {
    public static let denyAppRemovalTarget = "ios-deny-app-removal"

    public static func isDenyAppRemovalRequired(by rules: [BlockingRule]) -> Bool {
        return rules.contains(where: isDenyAppRemovalRule)
    }

    private static func isDenyAppRemovalRule(_ rule: BlockingRule) -> Bool {
        return rule.kind == .protection
            && rule.target == denyAppRemovalTarget
            && rule.alwaysBlocked
    }
}
