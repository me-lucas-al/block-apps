import type {
  Authenticator,
  BlockRuleRepository,
  PendingRuleChangeRepository,
  UserSession,
} from '@block-apps/api'
import { AppBlocker } from '../../modules/app-blocker'
import { MobileGoogleSignInRequester } from '../adapters/auth/MobileGoogleSignInRequester'
import { createMobileServices } from '../adapters/createMobileServices'
import { MobileDeviceIdStore } from '../device/MobileDeviceIdStore'
import { MobileStatusReporter } from '../device/MobileStatusReporter'
import type { AppBlockerPort } from '../ports/AppBlockerPort'
import type { GoogleSignInRequester } from '../ports/GoogleSignInRequester'
import { AppRulesSync } from '../sync/AppRulesSync'

export type Services = {
  readonly userSession: UserSession
  readonly authenticator: Authenticator
  readonly ruleRepository: BlockRuleRepository
  readonly pendingRuleChanges: PendingRuleChangeRepository
  readonly blocker: AppBlockerPort
  readonly rulesSync: AppRulesSync
  readonly statusReporter: MobileStatusReporter
  readonly googleSignIn: GoogleSignInRequester
}

export function createServices(): Services {
  const mobile = createMobileServices()
  const blocker = AppBlocker
  const rulesSync = new AppRulesSync({
    ruleRepository: mobile.ruleRepository,
    pendingRuleChanges: mobile.pendingRuleChanges,
    userSession: mobile.session,
    blocker,
  })
  const statusReporter = new MobileStatusReporter({
    deviceRepository: mobile.deviceRepository,
    blocker,
    deviceIdStore: new MobileDeviceIdStore(),
    session: mobile.session,
  })

  return {
    userSession: mobile.session,
    authenticator: mobile.authenticator,
    ruleRepository: mobile.ruleRepository,
    pendingRuleChanges: mobile.pendingRuleChanges,
    blocker,
    rulesSync,
    statusReporter,
    googleSignIn: new MobileGoogleSignInRequester(mobile.authenticator),
  }
}
