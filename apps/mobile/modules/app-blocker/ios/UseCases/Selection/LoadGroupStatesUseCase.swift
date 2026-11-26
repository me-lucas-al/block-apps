import ExpoModulesCore
import FamilyControls

struct GroupStatesRecord: Record {
    @Field var chosenRuleIds: [String] = []
    @Field var unreadableRuleIds: [String] = []
    @Field var unscheduledRuleIds: [String] = []
    @Field var oversizedRuleIds: [String] = []
    @Field var isTotalOverLimit: Bool = false
}

struct LoadGroupStatesUseCase {
    private let selectionStorage: SelectionStorage
    private let findUnscheduledRuleIds: FindUnscheduledRuleIdsUseCase

    init(
        selectionStorage: SelectionStorage = SelectionStorage(),
        findUnscheduledRuleIds: FindUnscheduledRuleIdsUseCase = FindUnscheduledRuleIdsUseCase()
    ) {
        self.selectionStorage = selectionStorage
        self.findUnscheduledRuleIds = findUnscheduledRuleIds
    }

    func loadGroupStates(ruleIds: [String]) -> GroupStatesRecord {
        let record: GroupStatesRecord = GroupStatesRecord()
        record.chosenRuleIds = ruleIds.filter { (ruleId: String) -> Bool in
            selectionStorage.hasNonEmptySelection(ruleId: ruleId)
        }
        record.unreadableRuleIds = ruleIds.filter { (ruleId: String) -> Bool in
            selectionStorage.loadSelectionResult(ruleId: ruleId).statusName == "unreadable"
        }
        record.unscheduledRuleIds = findUnscheduledRuleIds.findUnscheduledRuleIds()
        let limitReport: GroupLimitReport = GroupLimitReport(
            ruleIds: ruleIds,
            itemCountsByRuleId: countItems(ruleIds: ruleIds)
        )
        record.oversizedRuleIds = limitReport.oversizedRuleIds
        record.isTotalOverLimit = limitReport.isTotalOverLimit
        return record
    }

    private func countItems(ruleIds: [String]) -> [String: Int] {
        var itemCounts: [String: Int] = [:]
        for ruleId: String in ruleIds {
            guard let selection: FamilyActivitySelection = selectionStorage.loadSelection(ruleId: ruleId) else {
                continue
            }
            itemCounts[ruleId] = SelectionItemCount.total(
                applications: selection.applicationTokens.count,
                categories: selection.categoryTokens.count,
                webDomains: selection.webDomainTokens.count
            )
        }
        return itemCounts
    }
}
