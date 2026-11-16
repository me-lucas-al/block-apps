public enum AutomaticClockPolicy {
    public static func isAutomaticDateAndTimeRequired(by rules: [BlockingRule], hasAcceptedStrictMode: Bool) -> Bool {
        if rules.contains(where: { (rule: BlockingRule) -> Bool in rule.followsTimeWindows }) { return true }
        return hasAcceptedStrictMode && StrictModePolicy.hasStrictModeRule(in: rules)
    }
}
