import {
  type AuthService,
  type BlockRuleRepository,
  SupabaseAuthService,
  SupabaseBlockRuleRepository,
} from '@block-apps/api'
import { AppBlocker } from '../../modules/app-blocker'
import { createSupabaseClient } from '../adapters/createSupabaseClient'
import type { AppBlockerPort } from '../ports/AppBlockerPort'
import { AppRulesSync } from '../sync/AppRulesSync'

export type Services = {
  readonly auth: AuthService
  readonly ruleRepository: BlockRuleRepository
  readonly blocker: AppBlockerPort
  readonly rulesSync: AppRulesSync
  readonly sessionRefresh: { start(): void; stop(): void }
}

export function createServices(): Services {
  const client = createSupabaseClient()
  const auth = new SupabaseAuthService(client)
  const ruleRepository = new SupabaseBlockRuleRepository(client)

  return {
    auth,
    ruleRepository,
    blocker: AppBlocker,
    rulesSync: new AppRulesSync({ repository: ruleRepository, auth, blocker: AppBlocker }),
    sessionRefresh: {
      start: () => void client.auth.startAutoRefresh(),
      stop: () => void client.auth.stopAutoRefresh(),
    },
  }
}
