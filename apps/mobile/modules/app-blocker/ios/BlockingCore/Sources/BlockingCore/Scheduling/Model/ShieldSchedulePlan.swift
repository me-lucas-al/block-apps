public struct ShieldSchedulePlan: Equatable, Sendable {
    public let activities: [PlannedActivity]
    public let unscheduledRuleIds: Set<String>

    public init(activities: [PlannedActivity], unscheduledRuleIds: Set<String>) {
        self.activities = activities
        self.unscheduledRuleIds = unscheduledRuleIds
    }
}
