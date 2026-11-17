enum WindowPieceSplitter {
    static let minutesPerDay: Int = 1440

    static func splitAtMidnight(_ window: TimeWindow) -> [WindowPiece] {
        if window.startMinute == window.endMinute { return [] }
        let sortedDays: [Int] = window.days.sorted()
        if window.startMinute < window.endMinute {
            return sortedDays.map { (day: Int) -> WindowPiece in
                WindowPiece(dayOfWeek: day, startMinute: window.startMinute, endMinute: window.endMinute)
            }
        }
        return sortedDays.flatMap { (day: Int) -> [WindowPiece] in
            crossingMidnightPieces(startingOn: day, window: window)
        }
    }

    private static func crossingMidnightPieces(startingOn day: Int, window: TimeWindow) -> [WindowPiece] {
        let eveningPiece: WindowPiece = WindowPiece(
            dayOfWeek: day,
            startMinute: window.startMinute,
            endMinute: minutesPerDay
        )
        if window.endMinute == 0 { return [eveningPiece] }
        let morningPiece: WindowPiece = WindowPiece(
            dayOfWeek: (day + 1) % 7,
            startMinute: 0,
            endMinute: window.endMinute
        )
        return [eveningPiece, morningPiece]
    }
}
