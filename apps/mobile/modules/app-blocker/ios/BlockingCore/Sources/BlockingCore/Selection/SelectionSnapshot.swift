public struct SelectionSnapshot: Equatable, Sendable {
    public let applications: Set<String>
    public let categories: Set<String>
    public let webDomains: Set<String>

    public static let empty: SelectionSnapshot = SelectionSnapshot(applications: [], categories: [], webDomains: [])

    public init(applications: Set<String>, categories: Set<String>, webDomains: Set<String>) {
        self.applications = applications
        self.categories = categories
        self.webDomains = webDomains
    }

    public var isEmpty: Bool {
        return applications.isEmpty && categories.isEmpty && webDomains.isEmpty
    }

    public func union(_ other: SelectionSnapshot) -> SelectionSnapshot {
        return SelectionSnapshot(
            applications: applications.union(other.applications),
            categories: categories.union(other.categories),
            webDomains: webDomains.union(other.webDomains)
        )
    }

    public func subtracting(_ other: SelectionSnapshot) -> SelectionSnapshot {
        return SelectionSnapshot(
            applications: applications.subtracting(other.applications),
            categories: categories.subtracting(other.categories),
            webDomains: webDomains.subtracting(other.webDomains)
        )
    }
}
