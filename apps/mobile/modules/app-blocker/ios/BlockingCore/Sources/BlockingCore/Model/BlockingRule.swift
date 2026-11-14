public struct BlockingRule: Equatable, Sendable {
    public let id: String
    public let kind: TargetKind
    public let target: String
    public let alwaysBlocked: Bool
    public let windows: [TimeWindow]

    public init(
        id: String,
        kind: TargetKind,
        target: String,
        alwaysBlocked: Bool,
        windows: [TimeWindow]
    ) {
        self.id = id
        self.kind = kind
        self.target = target
        self.alwaysBlocked = alwaysBlocked
        self.windows = windows
    }
}
