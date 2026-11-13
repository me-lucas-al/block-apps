public struct SelectionChange: Equatable, Sendable {
    public let added: SelectionSnapshot
    public let removed: SelectionSnapshot
    public let appliedNow: SelectionSnapshot

    public init(from current: SelectionSnapshot, to proposed: SelectionSnapshot) {
        self.added = proposed.subtracting(current)
        self.removed = current.subtracting(proposed)
        self.appliedNow = current.union(proposed)
    }

    public var removesAnything: Bool {
        return !removed.isEmpty
    }
}
