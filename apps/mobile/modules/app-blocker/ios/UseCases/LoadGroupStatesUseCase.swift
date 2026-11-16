import ExpoModulesCore

struct GroupStatesRecord: Record {
    @Field var chosenRuleIds: [String] = []
    @Field var unreadableRuleIds: [String] = []
    @Field var unscheduledRuleIds: [String] = []
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
        return record
    }
}
