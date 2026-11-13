enum MinuteOfDayParser {
    static func parseMinuteOfDay(_ timeOfDay: String) throws -> Int {
        let parts = timeOfDay.split(separator: ":", omittingEmptySubsequences: false)
        guard parts.count == 2,
              let hours = Int(parts[0]), (0..<24).contains(hours),
              let minutes = Int(parts[1]), (0..<60).contains(minutes)
        else {
            throw RuleParsingError.invalidTimeOfDay(timeOfDay)
        }
        return hours * 60 + minutes
    }
}
