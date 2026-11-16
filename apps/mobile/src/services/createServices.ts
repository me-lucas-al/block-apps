import type {
  Authenticator,
  BlockRuleRepository,
  PendingRuleChangeRepository,
  UserSession,
} from '@block-apps/api'
import type { TargetType } from '@block-apps/core'
import { createDeviceAdapters } from '../adapters/blocker/createDeviceAdapters'
import { createMobileServices } from '../adapters/createMobileServices'
import { MobileDeviceIdStore } from '../device/MobileDeviceIdStore'
import { MobileStatusReporter } from '../device/MobileStatusReporter'
import { ExpoBackgroundTaskPort } from '../background/ExpoBackgroundTaskPort'
import { RulesSyncScheduler } from '../background/RulesSyncScheduler'
import type { BlockerPort } from '../ports/blocker/BlockerPort'
import type { GroupSelectionPort } from '../ports/groupselection/GroupSelectionPort'
import type { AppChoicePort } from '../ports/appchoice/AppChoicePort'
import type { ProtectionPort } from '../ports/protection/ProtectionPort'
import type { StrictModeController } from '../strictmode/StrictModeController'
import { createStrictMode } from '../strictmode/createStrictMode'
import { releaseStrictModeWhenBuildDisablesIt } from '../strictmode/releaseStrictModeWhenBuildDisablesIt'
import type { AppRulesSync } from '../sync/AppRulesSync'
import { createRulesSync } from '../sync/createRulesSync'
import { SelectionRemovalHolder } from '../rules/SelectionRemovalHolder'

export type Services = {
  readonly userSession: UserSession
  readonly authenticator: Authenticator
  readonly ruleRepository: BlockRuleRepository
  readonly pendingRuleChanges: PendingRuleChangeRepository
  readonly blocker: BlockerPort
  readonly protection: ProtectionPort
  readonly appChoice: AppChoicePort
  readonly groupSelection: GroupSelectionPort | null
  readonly strictMode: StrictModeController | null
  readonly listedTargetTypes: readonly TargetType[]
  readonly rulesSync: AppRulesSync
  readonly selectionRemovalHolder: SelectionRemovalHolder
  readonly rulesSyncScheduler: RulesSyncScheduler
  readonly statusReporter: MobileStatusReporter
}

export function createServices(): Services {
  const mobile = createMobileServices()
  const adapters = createDeviceAdapters(() => mobile.session.currentUserId())
  const rulesSync = createRulesSync(mobile, adapters.blocker)
  releaseStrictModeWhenBuildDisablesIt(mobile.config.strictModeEnabled, adapters.strictModeAcceptance)
  const statusReporter = new MobileStatusReporter({
    deviceRepository: mobile.deviceRepository,
    platform: adapters.platform,
    protection: adapters.protection,
    deviceIdStore: new MobileDeviceIdStore(adapters.platform),
    session: mobile.session,
  })

  return {
    userSession: mobile.session,
    authenticator: mobile.authenticator,
    ruleRepository: mobile.ruleRepository,
    pendingRuleChanges: mobile.pendingRuleChanges,
    blocker: adapters.blocker,
    protection: adapters.protection,
    appChoice: adapters.appChoice,
    groupSelection: adapters.groupSelection,
    strictMode: createStrictMode({
      platform: adapters.platform,
      isEnabledByBuild: mobile.config.strictModeEnabled,
      deviceAcceptance: adapters.strictModeAcceptance,
      ruleRepository: mobile.ruleRepository,
      pendingRuleChanges: mobile.pendingRuleChanges,
      rulesSync,
      isScreenTimeAuthorized: () => adapters.protection.isDeviceProtected(),
    }),
    listedTargetTypes: adapters.listedTargetTypes,
    rulesSync,
    selectionRemovalHolder: new SelectionRemovalHolder({
      ruleRepository: mobile.ruleRepository,
      pendingRuleChanges: mobile.pendingRuleChanges,
    }),
    rulesSyncScheduler: new RulesSyncScheduler(new ExpoBackgroundTaskPort()),
    statusReporter,
  }
}
