public enum BlockedRuleResolver {
    public static func resolveBlockedRules(_ rules: [BlockingRule], at moment: WeekMoment) -> [BlockingRule] {
        let unscheduledRuleIds = ShieldSchedulePlanner.plan(rules: rules).unscheduledRuleIds
        return rules.filter { rule in
            guard rule.kind.isEnforcedOnIos else { return false }
            if unscheduledRuleIds.contains(rule.id) { return true }
            return RuleEvaluator.isBlocked(rule, at: moment)
        }
    }
}
