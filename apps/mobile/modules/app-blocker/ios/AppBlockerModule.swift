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
            SelectionStorage().loadSelection(ruleId: ruleId) != nil
        }

        Function("hasPendingSelectionRemoval") { (ruleId: String) -> Bool in
            ResolvePendingSelectionUseCase().hasPendingSelection(ruleId: ruleId)
        }

        Function("commitPendingSelection") { (ruleId: String) in
            ResolvePendingSelectionUseCase().commitPendingSelection(ruleId: ruleId)
            ShieldApplier().applyShieldsForCurrentMoment()
        }

        Function("discardPendingSelection") { (ruleId: String) in
            ResolvePendingSelectionUseCase().discardPendingSelection(ruleId: ruleId)
        }

        Function("setRules") { (rulesJson: String) throws in
            try InstallRulesUseCase().installRules(fromJSON: rulesJson)
        }

        Function("reapplyShields") { () in
            ShieldApplier().applyShieldsForCurrentMoment()
        }

        Function("getUnscheduledRuleIds") { () -> [String] in
            InstallRulesUseCase().findUnscheduledRuleIds()
        }
    }
}
