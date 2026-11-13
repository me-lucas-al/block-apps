import type {
  Authenticator,
  BlockRuleRepository,
  PendingRuleChangeRepository,
  UserSession,
} from '@block-apps/api'
import { ChromeBackgroundNotifier } from '../../adapters/chrome/browser/ChromeBackgroundNotifier'
import { ChromeIncognitoPort } from '../../adapters/chrome/browser/ChromeIncognitoPort'
import { ChromeGoogleSignInRequester } from '../../adapters/chrome/identity/ChromeGoogleSignInRequester'
import { createExtensionServices } from '../../adapters/createExtensionServices'
import type { BackgroundNotifier } from '../../ports/browser/BackgroundNotifier'
import type { GoogleSignInRequester } from '../../ports/browser/GoogleSignInRequester'
import type { IncognitoPort } from '../../ports/browser/IncognitoPort'

export type Services = {
  readonly userSession: UserSession
  readonly authenticator: Authenticator
  readonly ruleRepository: BlockRuleRepository
  readonly pendingRuleChanges: PendingRuleChangeRepository
  readonly incognito: IncognitoPort
  readonly background: BackgroundNotifier
  readonly googleSignIn: GoogleSignInRequester
}

export function createServices(): Services {
  const extensionServices = createExtensionServices()
  return {
    userSession: extensionServices.session,
    authenticator: extensionServices.authenticator,
    ruleRepository: extensionServices.ruleRepository,
    pendingRuleChanges: extensionServices.pendingRuleChanges,
    incognito: new ChromeIncognitoPort(),
    background: new ChromeBackgroundNotifier(),
    googleSignIn: new ChromeGoogleSignInRequester(extensionServices.session),
  }
}
