import type {
  Authenticator,
  BlockRuleRepository,
  PendingRuleChangeRepository,
  UserSession,
} from '@block-apps/api'
import { Platform } from 'react-native'
import { AppBlocker } from '../../modules/app-blocker'
import { createPlatformAdapters } from '../adapters/blocker/createPlatformAdapters'
import { createMobileServices } from '../adapters/createMobileServices'
import { MobileDeviceIdStore } from '../device/MobileDeviceIdStore'
import { MobileStatusReporter } from '../device/MobileStatusReporter'
import { ExpoBackgroundTaskPort } from '../background/ExpoBackgroundTaskPort'
import { RulesSyncScheduler } from '../background/RulesSyncScheduler'
import type { AppChoicePort } from '../ports/appchoice/AppChoicePort'
import type { ProtectionPort } from '../ports/protection/ProtectionPort'
import type { AppRulesSync } from '../sync/AppRulesSync'
import { createRulesSync } from '../sync/createRulesSync'

export type Services = {
  readonly userSession: UserSession
  readonly authenticator: Authenticator
  readonly ruleRepository: BlockRuleRepository
  readonly pendingRuleChanges: PendingRuleChangeRepository
  readonly protection: ProtectionPort
  readonly appChoice: AppChoicePort
  readonly rulesSync: AppRulesSync
  readonly rulesSyncScheduler: RulesSyncScheduler
  readonly statusReporter: MobileStatusReporter
}

export function createServices(): Services {
  const mobile = createMobileServices()
  const adapters = createPlatformAdapters({ platformOs: Platform.OS, androidModule: AppBlocker })
  const rulesSync = createRulesSync(mobile, adapters.blocker)
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
    rulesSync,
    rulesSyncScheduler: new RulesSyncScheduler(new ExpoBackgroundTaskPort()),
    statusReporter,
  }
}
