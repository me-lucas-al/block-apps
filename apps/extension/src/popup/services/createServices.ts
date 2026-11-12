import {
  type AuthService,
  type BlockRuleRepository,
  SupabaseAuthService,
  SupabaseBlockRuleRepository,
} from '@block-apps/api'
import { ChromeBackgroundNotifier } from '../../adapters/chrome/browser/ChromeBackgroundNotifier'
import { ChromeIncognitoPort } from '../../adapters/chrome/browser/ChromeIncognitoPort'
import { createSupabaseClient } from '../../adapters/supabase/createSupabaseClient'
import type { BackgroundNotifier } from '../../ports/browser/BackgroundNotifier'
import type { IncognitoPort } from '../../ports/browser/IncognitoPort'

export type Services = {
  readonly auth: AuthService
  readonly ruleRepository: BlockRuleRepository
  readonly incognito: IncognitoPort
  readonly background: BackgroundNotifier
}

export function createServices(): Services {
  const client = createSupabaseClient()
  return {
    auth: new SupabaseAuthService(client),
    ruleRepository: new SupabaseBlockRuleRepository(client),
    incognito: new ChromeIncognitoPort(),
    background: new ChromeBackgroundNotifier(),
  }
}
