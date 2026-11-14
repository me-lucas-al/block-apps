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
import type { GroupSelectionPort } from '../ports/groupselection/GroupSelectionPort'
import type { AppChoicePort } from '../ports/appchoice/AppChoicePort'
import type { ProtectionPort } from '../ports/protection/ProtectionPort'
import type { StrictModeController } from '../strictmode/StrictModeController'
import { createStrictMode } from '../strictmode/createStrictMode'
import { AppRulesSync } from '../sync/AppRulesSync'

export type Services = {
  readonly userSession: UserSession
  readonly authenticator: Authenticator
  readonly ruleRepository: BlockRuleRepository
  readonly pendingRuleChanges: PendingRuleChangeRepository
  readonly protection: ProtectionPort
  readonly appChoice: AppChoicePort
  readonly groupSelection: GroupSelectionPort | null
  readonly strictMode: StrictModeController | null
  readonly listedTargetTypes: readonly TargetType[]
  readonly needsBackgroundRefresh: boolean
  readonly rulesSync: AppRulesSync
  readonly statusReporter: MobileStatusReporter
}

export function createServices(): Services {
  const mobile = createMobileServices()
  const adapters = createDeviceAdapters()
  const rulesSync = new AppRulesSync({
    ruleRepository: mobile.ruleRepository,
    pendingRuleChanges: mobile.pendingRuleChanges,
    userSession: mobile.session,
    blocker: adapters.blocker,
  })
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
    protection: adapters.protection,
    appChoice: adapters.appChoice,
    groupSelection: adapters.groupSelection,
    strictMode: createStrictMode({
      platform: adapters.platform,
      ruleRepository: mobile.ruleRepository,
      pendingRuleChanges: mobile.pendingRuleChanges,
      rulesSync,
    }),
    listedTargetTypes: adapters.listedTargetTypes,
    needsBackgroundRefresh: adapters.needsBackgroundRefresh,
    rulesSync,
    statusReporter,
  }
}
