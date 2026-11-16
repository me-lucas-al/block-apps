public enum ShieldSchedulePlanner {
    public static let maxActivities: Int = 20
    public static let minimumIntervalMinutes: Int = 15

    public static func plan(
        rules: [BlockingRule],
        maxActivities: Int = ShieldSchedulePlanner.maxActivities
    ) -> ShieldSchedulePlan {
        var scheduledTriggers: Set<ActivityTrigger> = []
        var unscheduledRuleIds: Set<String> = []

        for rule: BlockingRule in rules where rule.kind.isEnforcedOnIos {
            let ruleTriggers: Set<ActivityTrigger> = RuleTriggerCollector.collectTriggers(for: rule)
            let combinedTriggers: Set<ActivityTrigger> = scheduledTriggers.union(ruleTriggers)
            if combinedTriggers.count > maxActivities {
                unscheduledRuleIds.insert(rule.id)
                continue
            }
            scheduledTriggers = combinedTriggers
        }

        let activities: [PlannedActivity] = scheduledTriggers
            .sorted { (first: ActivityTrigger, second: ActivityTrigger) -> Bool in
                first.minuteOfDay < second.minuteOfDay
            }
            .map(makeActivity)
        return ShieldSchedulePlan(activities: activities, unscheduledRuleIds: unscheduledRuleIds)
    }

    private static func makeActivity(from trigger: ActivityTrigger) -> PlannedActivity {
        let endMinute: Int = (trigger.minuteOfDay + minimumIntervalMinutes) % RuleTriggerCollector.minutesPerDay
        return PlannedActivity(
            name: "tick-\(trigger.minuteOfDay)",
            startMinute: trigger.minuteOfDay,
            endMinute: endMinute
        )
    }
}
