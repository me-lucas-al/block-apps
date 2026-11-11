import { type BlockRuleRepository, SupabaseBlockRuleRepository } from '@block-apps/api'
import { ChromeBackgroundNotifier } from '../../adapters/chrome/ChromeBackgroundNotifier'
import { ChromeIncognitoPort } from '../../adapters/chrome/ChromeIncognitoPort'
import { SupabaseAuthService } from '../../adapters/supabase/SupabaseAuthService'
import { createSupabaseClient } from '../../adapters/supabase/createSupabaseClient'
import type { AuthService } from '../../ports/AuthService'
import type { BackgroundNotifier } from '../../ports/BackgroundNotifier'
import type { IncognitoPort } from '../../ports/IncognitoPort'

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
