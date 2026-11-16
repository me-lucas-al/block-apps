public enum AutomaticClockPolicy {
    public static func isAutomaticDateAndTimeRequired(by rules: [BlockingRule]) -> Bool {
        if rules.contains(where: { (rule: BlockingRule) -> Bool in rule.followsTimeWindows }) { return true }
        return StrictModePolicy.hasStrictModeRule(in: rules)
    }
}
