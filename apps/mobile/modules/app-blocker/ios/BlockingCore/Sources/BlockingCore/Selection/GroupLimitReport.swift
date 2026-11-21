public struct GroupLimitReport: Equatable, Sendable {
    public let oversizedRuleIds: [String]
    public let isTotalOverLimit: Bool

    public init(ruleIds: [String], itemCountsByRuleId: [String: Int]) {
        self.oversizedRuleIds = ruleIds.filter { (ruleId: String) -> Bool in
            SelectionLimits.exceedsReportedLimit(itemCount: itemCountsByRuleId[ruleId] ?? 0)
        }
        let totalItemCount: Int = itemCountsByRuleId.values.reduce(0, +)
        self.isTotalOverLimit = SelectionLimits.exceedsReportedLimit(itemCount: totalItemCount)
    }
}
