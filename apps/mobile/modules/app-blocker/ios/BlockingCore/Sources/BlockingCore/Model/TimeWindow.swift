public struct TimeWindow: Equatable, Hashable, Sendable {
    public let days: Set<Int>
    public let startMinute: Int
    public let endMinute: Int

    public init(days: Set<Int>, startMinute: Int, endMinute: Int) {
        self.days = days
        self.startMinute = startMinute
        self.endMinute = endMinute
    }
}
