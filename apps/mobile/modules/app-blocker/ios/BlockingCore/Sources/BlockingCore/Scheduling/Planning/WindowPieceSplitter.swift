enum WindowPieceSplitter {
    static let minutesPerDay = 1440

    static func splitAtMidnight(_ window: TimeWindow) -> [WindowPiece] {
        if window.startMinute == window.endMinute { return [] }
        let sortedDays = window.days.sorted()
        if window.startMinute < window.endMinute {
            return sortedDays.map { day in
                WindowPiece(dayOfWeek: day, startMinute: window.startMinute, endMinute: window.endMinute)
            }
        }
        return sortedDays.flatMap { day in crossingMidnightPieces(startingOn: day, window: window) }
    }

    private static func crossingMidnightPieces(startingOn day: Int, window: TimeWindow) -> [WindowPiece] {
        let eveningPiece = WindowPiece(dayOfWeek: day, startMinute: window.startMinute, endMinute: minutesPerDay)
        if window.endMinute == 0 { return [eveningPiece] }
        let morningPiece = WindowPiece(dayOfWeek: (day + 1) % 7, startMinute: 0, endMinute: window.endMinute)
        return [eveningPiece, morningPiece]
    }
}
