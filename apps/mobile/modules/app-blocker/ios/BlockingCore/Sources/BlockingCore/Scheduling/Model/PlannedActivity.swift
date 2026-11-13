public struct PlannedActivity: Equatable, Hashable, Sendable {
    public let name: String
    public let weekday: Int
    public let startMinute: Int
    public let endMinute: Int

    public init(name: String, weekday: Int, startMinute: Int, endMinute: Int) {
        self.name = name
        self.weekday = weekday
        self.startMinute = startMinute
        self.endMinute = endMinute
    }
}
