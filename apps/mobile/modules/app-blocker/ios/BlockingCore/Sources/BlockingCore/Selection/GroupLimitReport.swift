public struct GroupLimitReport: Equatable, Sendable {
    public let oversizedRuleIds: [String]
    public let isTotalOverLimit: Bool

    public init(ruleIds: [String], itemCountsByRuleId: [String: Int]) {
        self.oversizedRuleIds = ruleIds.filter { (ruleId: String) -> Bool in
            SelectionLimits.exceedsReportedLimit(itemCount: itemCountsByRuleId[ruleId] ?? 0)
        }
        let totalItemCount: Int = ruleIds.reduce(0) { (runningTotal: Int, ruleId: String) -> Int in
            runningTotal + (itemCountsByRuleId[ruleId] ?? 0)
        }
        self.isTotalOverLimit = SelectionLimits.exceedsReportedLimit(itemCount: totalItemCount)
    }
}
