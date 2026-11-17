import type { createMobileServices } from '../adapters/createMobileServices'
import type { BlockerPort } from '../ports/blocker/BlockerPort'
import { AppRulesSync } from './AppRulesSync'

type RulesSyncServices = Pick<
  ReturnType<typeof createMobileServices>,
  'ruleRepository' | 'pendingRuleChanges' | 'session' | 'http'
>

export function createRulesSync(
  mobile: RulesSyncServices,
  blocker: BlockerPort,
): AppRulesSync {
  return new AppRulesSync({
    ruleRepository: mobile.ruleRepository,
    pendingRuleChanges: mobile.pendingRuleChanges,
    userSession: mobile.session,
    serverClock: mobile.http.serverClock,
    blocker,
  })
}
