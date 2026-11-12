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
import { AppBlocker } from '../../modules/app-blocker'
import { createSupabaseClient } from '../adapters/createSupabaseClient'
import type { AppBlockerPort } from '../ports/AppBlockerPort'
import { AppRulesSync } from '../sync/AppRulesSync'

export type Services = {
  readonly userSession: UserSession
  readonly authenticator: Authenticator
  readonly ruleRepository: BlockRuleRepository
  readonly pendingRuleChanges: PendingRuleChangeRepository
  readonly blocker: AppBlockerPort
  readonly rulesSync: AppRulesSync
  readonly sessionRefresh: { start(): void; stop(): void }
}

export function createServices(): Services {
  const client = createSupabaseClient()
  const userSession = new SupabaseUserSession(client)
  const ruleRepository = new SupabaseBlockRuleRepository(client)
  const pendingRuleChanges = new SupabasePendingRuleChangeRepository(client)

  return {
    userSession,
    authenticator: new SupabaseAuthenticator(client),
    ruleRepository,
    pendingRuleChanges,
    blocker: AppBlocker,
    rulesSync: new AppRulesSync({ ruleRepository, pendingRuleChanges, userSession, blocker: AppBlocker }),
    sessionRefresh: {
      start: () => void client.auth.startAutoRefresh(),
      stop: () => void client.auth.stopAutoRefresh(),
    },
  }
}
