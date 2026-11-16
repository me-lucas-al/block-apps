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
            .sorted(by: isEarlierInWeek)
            .map(makeActivity)
        return ShieldSchedulePlan(activities: activities, unscheduledRuleIds: unscheduledRuleIds)
    }

    private static func isEarlierInWeek(_ first: ActivityTrigger, _ second: ActivityTrigger) -> Bool {
        if first.dayOfWeek != second.dayOfWeek { return first.dayOfWeek < second.dayOfWeek }
        return first.minuteOfDay < second.minuteOfDay
    }

    private static func makeActivity(from trigger: ActivityTrigger) -> PlannedActivity {
        let unwrappedEndMinute: Int = trigger.minuteOfDay + minimumIntervalMinutes
        let endsOnNextDay: Bool = unwrappedEndMinute >= WindowPieceSplitter.minutesPerDay
        let weekday: Int = trigger.dayOfWeek + 1
        return PlannedActivity(
            name: "tick-\(trigger.dayOfWeek)-\(trigger.minuteOfDay)",
            weekday: weekday,
            startMinute: trigger.minuteOfDay,
            endMinute: unwrappedEndMinute % WindowPieceSplitter.minutesPerDay,
            endWeekday: endsOnNextDay ? weekday % 7 + 1 : weekday
        )
    }
}
