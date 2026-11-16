import Foundation
import ManagedSettings

struct ShieldApplier {
    private let rulesStorage: SharedRulesStorage
    private let activityStorage: AppActivityStorage
    private let scheduleStatusStorage: ScheduleStatusStorage
    private let targetsBuilder: ShieldTargetsBuilder
    private let settingsWriter: ShieldSettingsWriter
    private let currentDate: () -> Date
    private let calendar: Calendar

    init(
        rulesStorage: SharedRulesStorage = SharedRulesStorage(),
        selectionStorage: SelectionStorage = SelectionStorage(),
        activityStorage: AppActivityStorage = AppActivityStorage(),
        scheduleStatusStorage: ScheduleStatusStorage = ScheduleStatusStorage(),
        store: ManagedSettingsStore = ManagedSettingsStore(),
        currentDate: @escaping () -> Date = { Date() },
        calendar: Calendar = Calendar.current
    ) {
        self.rulesStorage = rulesStorage
        self.activityStorage = activityStorage
        self.scheduleStatusStorage = scheduleStatusStorage
        self.targetsBuilder = ShieldTargetsBuilder(selectionStorage: selectionStorage)
        self.settingsWriter = ShieldSettingsWriter(store: store)
        self.currentDate = currentDate
        self.calendar = calendar
    }

    func applyShieldsForCurrentMoment() {
        guard let rules: [BlockingRule] = rulesStorage.loadRules() else { return }
        let now: Date = currentDate()
        let blockedRules: [BlockingRule] = BlockedRuleResolver.resolveBlockedRules(
            rules,
            at: WeekMoment(date: now, calendar: calendar),
            isScheduleIncomplete: scheduleStatusStorage.loadIsIncomplete()
        )
        settingsWriter.writeShields(targetsBuilder.buildTargets(for: blockedRules))
        settingsWriter.requireAutomaticDateAndTime(rules.contains { $0.followsTimeWindows })
        settingsWriter.denyAppRemoval(
            StrictModePolicy.isDenyAppRemovalRequired(
                by: rules,
                lastAppOpenedAt: activityStorage.loadLastAppOpenedAt(),
                now: now
            )
        )
    }
}
