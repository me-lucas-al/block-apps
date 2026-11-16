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

        AsyncFunction("presentAppSelectionPicker") { (ruleId: String, ownerId: String) async -> String in
            await ChooseAppsUseCase().chooseApps(forRuleId: ruleId, ownerId: ownerId)
        }

        Function("hasSelection") { (ruleId: String) -> Bool in
            SelectionStorage().hasNonEmptySelection(ruleId: ruleId)
        }

        Function("holdPendingSelection") { (ruleId: String, effectiveAtIso: String, ownerId: String) throws in
            do {
                try HoldPendingSelectionUseCase().holdPendingSelection(
                    ruleId: ruleId,
                    effectiveAtIso: effectiveAtIso,
                    ownerId: ownerId
                )
            } catch InstallRulesError.anotherAccountOwnsTheRules {
                throw AnotherAccountOwnsRulesException()
            }
        }

        Function("discardPendingSelection") { (ruleId: String) in
            DiscardPendingSelectionUseCase().discardPendingSelection(ruleId: ruleId)
        }

        Function("setRules") { (json: String, ownerId: String, pendingIds: [String], serverNow: String?) throws in
            do {
                try InstallRulesUseCase().installRules(
                    fromJSON: json,
                    ownerId: ownerId,
                    pendingRuleIds: pendingIds,
                    serverNowIso: serverNow
                )
            } catch InstallRulesError.anotherAccountOwnsTheRules {
                throw AnotherAccountOwnsRulesException()
            }
        }

        Function("reapplyShields") { () in
            ShieldApplier().applyShieldsForCurrentMoment()
        }

        Function("recordAppOpened") { () in
            RecordAppOpenedUseCase().recordAppOpened()
        }

        Function("getUnscheduledRuleIds") { () -> [String] in
            FindUnscheduledRuleIdsUseCase().findUnscheduledRuleIds()
        }
    }
}
