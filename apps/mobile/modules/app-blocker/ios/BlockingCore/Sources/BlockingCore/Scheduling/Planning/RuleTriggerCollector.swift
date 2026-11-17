enum RuleTriggerCollector {
    static let minutesPerDay: Int = 1440

    static func collectTriggers(for rule: BlockingRule) -> Set<ActivityTrigger> {
        if rule.alwaysBlocked { return [] }
        let boundaryMinutes: [Int] = rule.windows
            .filter { (window: TimeWindow) -> Bool in window.startMinute != window.endMinute }
            .flatMap { (window: TimeWindow) -> [Int] in [window.startMinute, window.endMinute] }
        return Set(boundaryMinutes.map { (minute: Int) -> ActivityTrigger in
            ActivityTrigger(minuteOfDay: minute % minutesPerDay)
        })
    }
}
