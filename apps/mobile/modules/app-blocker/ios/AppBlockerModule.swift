import ExpoModulesCore

public class AppBlockerModule: Module {
    public func definition() -> ModuleDefinition {
        Name("AppBlocker")

        Function("getAuthorizationStatus") { () -> String in
            ScreenTimeAuthorization.readStatusName()
        }

        AsyncFunction("requestScreenTimeAuthorization") { () async throws -> String in
            try await ScreenTimeAuthorization.requestIndividualAuthorization()
        }

        AsyncFunction("presentAppSelectionPicker") { (ruleId: String) async -> String in
            await ChooseAppsUseCase().chooseApps(forRuleId: ruleId)
        }

        Function("hasSelection") { (ruleId: String) -> Bool in
            SelectionStorage().hasNonEmptySelection(ruleId: ruleId)
        }

        Function("hasPendingSelectionRemoval") { (ruleId: String) -> Bool in
            SelectionStorage().loadPendingSelection(ruleId: ruleId) != nil
        }

        Function("holdPendingSelection") { (ruleId: String, effectiveAtIso: String) in
            SelectionStorage().holdPendingSelection(ruleId: ruleId, effectiveAtIso: effectiveAtIso)
        }

        Function("getPendingSelectionHold") { (ruleId: String) -> String? in
            SelectionStorage().loadPendingSelectionHold(ruleId: ruleId)
        }

        Function("commitPendingSelection") { (ruleId: String) in
            CommitPendingSelectionUseCase().commitPendingSelection(ruleId: ruleId)
            ShieldApplier().applyShieldsForCurrentMoment()
        }

        Function("discardPendingSelection") { (ruleId: String) in
            DiscardPendingSelectionUseCase().discardPendingSelection(ruleId: ruleId)
        }

        Function("setRules") { (rulesJson: String) throws in
            try InstallRulesUseCase().installRules(fromJSON: rulesJson)
        }

        Function("reapplyShields") { () in
            ShieldApplier().applyShieldsForCurrentMoment()
        }

        Function("getUnscheduledRuleIds") { () -> [String] in
            FindUnscheduledRuleIdsUseCase().findUnscheduledRuleIds()
        }
    }
}
