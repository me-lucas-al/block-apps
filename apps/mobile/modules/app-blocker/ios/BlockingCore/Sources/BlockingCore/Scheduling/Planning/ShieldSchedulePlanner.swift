public enum ShieldSchedulePlanner {
    public static let maxActivities = 20
    public static let minimumIntervalMinutes = 15

    public static func plan(
        rules: [BlockingRule],
        maxActivities: Int = ShieldSchedulePlanner.maxActivities
    ) -> ShieldSchedulePlan {
        var scheduledTriggers = Set<ActivityTrigger>()
        var unscheduledRuleIds = Set<String>()

        for rule in rules where rule.kind.isEnforcedOnIos {
            let ruleTriggers = RuleTriggerCollector.collectTriggers(for: rule)
            let combinedTriggers = scheduledTriggers.union(ruleTriggers)
            if combinedTriggers.count > maxActivities {
                unscheduledRuleIds.insert(rule.id)
                continue
            }
            scheduledTriggers = combinedTriggers
        }

        let activities = scheduledTriggers
            .sorted(by: isEarlierInWeek)
            .map(makeActivity)
        return ShieldSchedulePlan(activities: activities, unscheduledRuleIds: unscheduledRuleIds)
    }

    private static func isEarlierInWeek(_ first: ActivityTrigger, _ second: ActivityTrigger) -> Bool {
        if first.dayOfWeek != second.dayOfWeek { return first.dayOfWeek < second.dayOfWeek }
        return first.minuteOfDay < second.minuteOfDay
    }

    private static func makeActivity(from trigger: ActivityTrigger) -> PlannedActivity {
        let unwrappedEndMinute = trigger.minuteOfDay + minimumIntervalMinutes
        let endsOnNextDay = unwrappedEndMinute >= WindowPieceSplitter.minutesPerDay
        let weekday = trigger.dayOfWeek + 1
        return PlannedActivity(
            name: "tick-\(trigger.dayOfWeek)-\(trigger.minuteOfDay)",
            weekday: weekday,
            startMinute: trigger.minuteOfDay,
            endMinute: unwrappedEndMinute % WindowPieceSplitter.minutesPerDay,
            endWeekday: endsOnNextDay ? weekday % 7 + 1 : weekday
        )
    }
}
