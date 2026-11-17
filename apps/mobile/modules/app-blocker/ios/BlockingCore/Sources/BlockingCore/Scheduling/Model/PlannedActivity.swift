public struct PlannedActivity: Equatable, Hashable, Sendable {
    public let name: String
    public let startMinute: Int
    public let endMinute: Int

    public init(name: String, startMinute: Int, endMinute: Int) {
        self.name = name
        self.startMinute = startMinute
        self.endMinute = endMinute
    }
}
