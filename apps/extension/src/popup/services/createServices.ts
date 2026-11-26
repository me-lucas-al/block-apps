import type {
  Authenticator,
  BlockRuleRepository,
  PendingRuleChangeRepository,
  UserSession,
} from '@block-apps/api'
import { ChromeBackgroundNotifier } from '../../adapters/chrome/browser/ChromeBackgroundNotifier'
import { createIncognitoPort } from '../../adapters/browser/createIncognitoPort'
import { ExtensionApiHostAccessPort } from '../../adapters/browser/ExtensionApiHostAccessPort'
import { ChromeGoogleSignInRequester } from '../../adapters/chrome/identity/ChromeGoogleSignInRequester'
import { ChromeSessionSync } from '../../adapters/chrome/storage/ChromeSessionSync'
import { createExtensionServices } from '../../adapters/createExtensionServices'
import type { BackgroundNotifier } from '../../ports/browser/BackgroundNotifier'
import type { GoogleSignInRequester } from '../../ports/browser/GoogleSignInRequester'
import type { HostAccessPort } from '../../ports/browser/HostAccessPort'
import type { BrowserTarget } from '../../shared/browser/browserTarget'
import type { IncognitoPort } from '../../ports/browser/IncognitoPort'
import type { SessionSync } from '../../ports/browser/SessionSync'

export type Services = {
  readonly userSession: UserSession
  readonly authenticator: Authenticator
  readonly ruleRepository: BlockRuleRepository
  readonly pendingRuleChanges: PendingRuleChangeRepository
  readonly incognito: IncognitoPort
  readonly hostAccess: HostAccessPort
  readonly background: BackgroundNotifier
  readonly googleSignIn: GoogleSignInRequester
  readonly sessionSync: SessionSync
}

export function createServices(target: BrowserTarget): Services {
  const extensionServices = createExtensionServices()
  return {
    userSession: extensionServices.session,
    authenticator: extensionServices.authenticator,
    ruleRepository: extensionServices.ruleRepository,
    pendingRuleChanges: extensionServices.pendingRuleChanges,
    incognito: createIncognitoPort(target),
    hostAccess: new ExtensionApiHostAccessPort(),
    background: new ChromeBackgroundNotifier(),
    googleSignIn: new ChromeGoogleSignInRequester(),
    sessionSync: new ChromeSessionSync(extensionServices.session),
  }
}
