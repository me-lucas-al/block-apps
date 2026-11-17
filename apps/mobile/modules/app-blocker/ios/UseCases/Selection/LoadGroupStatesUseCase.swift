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
        let itemCounts: [String: Int] = countItems(ruleIds: ruleIds)
        record.oversizedRuleIds = ruleIds.filter { (ruleId: String) -> Bool in
            SelectionLimits.exceedsReportedLimit(itemCount: itemCounts[ruleId] ?? 0)
        }
        let totalCount: Int = itemCounts.values.reduce(0, +)
        record.isTotalOverLimit = SelectionLimits.exceedsReportedLimit(itemCount: totalCount)
        return record
    }

    private func countItems(ruleIds: [String]) -> [String: Int] {
        var itemCounts: [String: Int] = [:]
        for ruleId: String in ruleIds {
            guard let selection: FamilyActivitySelection = selectionStorage.loadSelection(ruleId: ruleId) else {
                continue
            }
            itemCounts[ruleId] = selection.applicationTokens.count
                + selection.categoryTokens.count
                + selection.webDomainTokens.count
        }
        return itemCounts
    }
}
