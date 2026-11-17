import Foundation
import ManagedSettings

struct ShieldApplier {
    private let rulesStorage: SharedRulesStorage
    private let targetsBuilder: ShieldTargetsBuilder
    private let settingsWriter: ShieldSettingsWriter
    private let currentDate: () -> Date
    private let calendar: Calendar

    init(
        rulesStorage: SharedRulesStorage = SharedRulesStorage(),
        selectionStorage: SelectionStorage = SelectionStorage(),
        store: ManagedSettingsStore = ManagedSettingsStore(),
        currentDate: @escaping () -> Date = { Date() },
        calendar: Calendar = Calendar.current
    ) {
        self.rulesStorage = rulesStorage
        self.targetsBuilder = ShieldTargetsBuilder(selectionStorage: selectionStorage)
        self.settingsWriter = ShieldSettingsWriter(store: store)
        self.currentDate = currentDate
        self.calendar = calendar
    }

    func applyShieldsForCurrentMoment() {
        guard let rules = rulesStorage.loadRules() else { return }
        let moment = WeekMoment(date: currentDate(), calendar: calendar)
        let blockedRules = BlockedRuleResolver.resolveBlockedRules(rules, at: moment)
        settingsWriter.writeShields(targetsBuilder.buildTargets(for: blockedRules))
        settingsWriter.requireAutomaticDateAndTime(rules.contains { $0.followsTimeWindows })
        settingsWriter.denyAppRemoval(StrictModePolicy.isDenyAppRemovalRequired(by: rules))
    }
}
