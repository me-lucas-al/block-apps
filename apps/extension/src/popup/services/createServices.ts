import {
  type Authenticator,
  type BlockRuleRepository,
  type PendingRuleChangeRepository,
  type UserSession,
  SupabaseAuthenticator,
  SupabaseBlockRuleRepository,
  SupabasePendingRuleChangeRepository,
  SupabaseUserSession,
} from '@block-apps/api'
import { ChromeBackgroundNotifier } from '../../adapters/chrome/browser/ChromeBackgroundNotifier'
import { ChromeIncognitoPort } from '../../adapters/chrome/browser/ChromeIncognitoPort'
import { createSupabaseClient } from '../../adapters/supabase/createSupabaseClient'
import type { BackgroundNotifier } from '../../ports/browser/BackgroundNotifier'
import type { IncognitoPort } from '../../ports/browser/IncognitoPort'

export type Services = {
  readonly userSession: UserSession
  readonly authenticator: Authenticator
  readonly ruleRepository: BlockRuleRepository
  readonly pendingRuleChanges: PendingRuleChangeRepository
  readonly incognito: IncognitoPort
  readonly background: BackgroundNotifier
}

export function createServices(): Services {
  const client = createSupabaseClient()
  return {
    userSession: new SupabaseUserSession(client),
    authenticator: new SupabaseAuthenticator(client),
    ruleRepository: new SupabaseBlockRuleRepository(client),
    pendingRuleChanges: new SupabasePendingRuleChangeRepository(client),
    incognito: new ChromeIncognitoPort(),
    background: new ChromeBackgroundNotifier(),
  }
}
