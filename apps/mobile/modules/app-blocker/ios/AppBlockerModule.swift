import ExpoModulesCore

public class AppBlockerModule: Module {
    public func definition() -> ModuleDefinition {
        Name("AppBlocker")

        Function("getAuthorizationStatus") { () -> String in
            ScreenTimeAuthorization.readStatus().rawValue
        }

        AsyncFunction("requestScreenTimeAuthorization") { () async throws -> String in
            try await ScreenTimeAuthorization.requestIndividualAuthorization().rawValue
        }

        AsyncFunction("presentAppSelectionPicker") { (ruleId: String, ownerId: String) async throws -> String in
            try await NativeExceptionMapper.runAsync {
                try await ChooseAppsUseCase().chooseApps(forRuleId: ruleId, ownerId: ownerId).rawValue
            }
        }

        AsyncFunction("getGroupStates") { (ruleIds: [String]) -> GroupStatesRecord in
            LoadGroupStatesUseCase().loadGroupStates(ruleIds: ruleIds)
        }

        Function("holdPendingSelection") { (ruleId: String, effectiveAtIso: String, ownerId: String) throws in
            try NativeExceptionMapper.run {
                try HoldPendingSelectionUseCase().holdPendingSelection(
                    ruleId: ruleId,
                    effectiveAtIso: effectiveAtIso,
                    ownerId: ownerId
                )
            }
        }

        Function("discardPendingSelection") { (ruleId: String) in
            DiscardPendingSelectionUseCase().discardPendingSelection(ruleId: ruleId)
        }

        AsyncFunction("setRules") { (json: String, ownerId: String, pendingIds: [String], serverNow: String?) throws in
            try NativeExceptionMapper.run {
                try ModuleStateQueue.run {
                    try InstallRulesUseCase().installRules(
                        fromJSON: json,
                        ownerId: ownerId,
                        pendingRuleIds: pendingIds,
                        serverNowIso: serverNow
                    )
                }
            }
        }

        Function("hasAcceptedStrictMode") { () -> Bool in
            StrictModeAcceptanceStorage().loadHasAcceptedOnThisDevice()
        }

        Function("acceptStrictMode") { () throws in
            try NativeExceptionMapper.run { try AcceptStrictModeUseCase().acceptStrictModeOnThisDevice() }
        }

        Function("revokeStrictMode") { () in
            ModuleStateQueue.run { RevokeStrictModeUseCase().revokeStrictModeOnThisDevice() }
        }

        AsyncFunction("reapplyShields") { () in
            ModuleStateQueue.run { ShieldApplier().applyShieldsForCurrentMoment() }
        }

        AsyncFunction("recordAppOpened") { () in
            ModuleStateQueue.run { RecordAppOpenedUseCase().recordAppOpened() }
        }
    }
}
