public enum ShieldSchedulePlanner {
    public static let maxActivities: Int = 20
    public static let minimumIntervalMinutes: Int = 15
    public static let strictModeHeartbeatName: String = "strict-mode-heartbeat"
    public static let strictModeHeartbeatStartMinute: Int = 4 * 60

    public static func plan(
        rules: [BlockingRule],
        maxActivities: Int = ShieldSchedulePlanner.maxActivities
    ) -> ShieldSchedulePlan {
        let needsHeartbeat: Bool = StrictModePolicy.hasStrictModeRule(in: rules)
        let ruleActivityLimit: Int = needsHeartbeat ? maxActivities - 1 : maxActivities
        var scheduledTriggers: Set<ActivityTrigger> = []
        var unscheduledRuleIds: Set<String> = []

        for rule: BlockingRule in rules where rule.kind.isEnforcedOnIos {
            let ruleTriggers: Set<ActivityTrigger> = RuleTriggerCollector.collectTriggers(for: rule)
            let combinedTriggers: Set<ActivityTrigger> = scheduledTriggers.union(ruleTriggers)
            if combinedTriggers.count > ruleActivityLimit {
                unscheduledRuleIds.insert(rule.id)
                continue
            }
            scheduledTriggers = combinedTriggers
        }

        let tickActivities: [PlannedActivity] = scheduledTriggers
            .sorted { (first: ActivityTrigger, second: ActivityTrigger) -> Bool in
                first.minuteOfDay < second.minuteOfDay
            }
            .map(makeActivity)
        let heartbeat: [PlannedActivity] = needsHeartbeat ? [makeHeartbeatActivity()] : []
        return ShieldSchedulePlan(activities: tickActivities + heartbeat, unscheduledRuleIds: unscheduledRuleIds)
    }

    private static func makeActivity(from trigger: ActivityTrigger) -> PlannedActivity {
        return PlannedActivity(
            name: "tick-\(trigger.minuteOfDay)",
            startMinute: trigger.minuteOfDay,
            endMinute: endMinute(afterStartMinute: trigger.minuteOfDay)
        )
    }

    private static func makeHeartbeatActivity() -> PlannedActivity {
        return PlannedActivity(
            name: strictModeHeartbeatName,
            startMinute: strictModeHeartbeatStartMinute,
            endMinute: endMinute(afterStartMinute: strictModeHeartbeatStartMinute)
        )
    }

    private static func endMinute(afterStartMinute startMinute: Int) -> Int {
        return (startMinute + minimumIntervalMinutes) % RuleTriggerCollector.minutesPerDay
    }
}
