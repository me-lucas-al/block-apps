enum RuleTriggerCollector {
    static func collectTriggers(for rule: BlockingRule) -> Set<ActivityTrigger> {
        if rule.alwaysBlocked { return [] }
        let pieces = rule.windows.flatMap(WindowPieceSplitter.splitAtMidnight)
        return Set(pieces.flatMap(triggers(of:)))
    }

    private static func triggers(of piece: WindowPiece) -> [ActivityTrigger] {
        return [
            ActivityTrigger(dayOfWeek: piece.dayOfWeek, minuteOfDay: piece.startMinute),
            endTrigger(of: piece),
        ]
    }

    private static func endTrigger(of piece: WindowPiece) -> ActivityTrigger {
        if piece.endMinute == WindowPieceSplitter.minutesPerDay {
            return ActivityTrigger(dayOfWeek: (piece.dayOfWeek + 1) % 7, minuteOfDay: 0)
        }
        return ActivityTrigger(dayOfWeek: piece.dayOfWeek, minuteOfDay: piece.endMinute)
    }
}
