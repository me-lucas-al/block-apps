public enum BlockedRuleResolver {
    public static func resolveBlockedRules(_ rules: [BlockingRule], at moment: WeekMoment) -> [BlockingRule] {
        let unscheduledRuleIds: Set<String> = ShieldSchedulePlanner.plan(rules: rules).unscheduledRuleIds
        return rules.filter { (rule: BlockingRule) -> Bool in
            guard rule.kind.isEnforcedOnIos else { return false }
            if unscheduledRuleIds.contains(rule.id) { return true }
            return RuleEvaluator.isBlocked(rule, at: moment)
        }
    }
}
