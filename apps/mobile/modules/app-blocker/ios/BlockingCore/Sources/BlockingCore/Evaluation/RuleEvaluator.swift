public enum RuleEvaluator {
    public static func isBlocked(_ rule: BlockingRule, at moment: WeekMoment) -> Bool {
        return isBlocked(rule, dayOfWeek: moment.dayOfWeek, minuteOfDay: moment.minuteOfDay)
    }

    public static func isBlocked(_ rule: BlockingRule, dayOfWeek: Int, minuteOfDay: Int) -> Bool {
        if rule.alwaysBlocked { return true }
        return !rule.windows.contains { (window: TimeWindow) -> Bool in
            isWithin(window, dayOfWeek: dayOfWeek, minuteOfDay: minuteOfDay)
        }
    }

    private static func isWithin(_ window: TimeWindow, dayOfWeek: Int, minuteOfDay: Int) -> Bool {
        let start: Int = window.startMinute
        let end: Int = window.endMinute
        if start == end { return false }

        let startsToday: Bool = window.days.contains(dayOfWeek)
        if start < end { return startsToday && minuteOfDay >= start && minuteOfDay < end }

        let startedYesterday: Bool = window.days.contains(previousDay(of: dayOfWeek))
        let inEveningPart: Bool = startsToday && minuteOfDay >= start
        let inMorningPart: Bool = startedYesterday && minuteOfDay < end
        return inEveningPart || inMorningPart
    }

    private static func previousDay(of dayOfWeek: Int) -> Int {
        return (dayOfWeek + 6) % 7
    }
}
