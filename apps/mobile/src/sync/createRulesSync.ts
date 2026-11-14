import type { createMobileServices } from '../adapters/createMobileServices'
import type { AppBlockerPort } from '../ports/AppBlockerPort'
import { AppRulesSync } from './AppRulesSync'

type RulesSyncServices = Pick<
  ReturnType<typeof createMobileServices>,
  'ruleRepository' | 'pendingRuleChanges' | 'session'
>

export function createRulesSync(
  mobile: RulesSyncServices,
  blocker: Pick<AppBlockerPort, 'setRules'>,
): AppRulesSync {
  return new AppRulesSync({
    ruleRepository: mobile.ruleRepository,
    pendingRuleChanges: mobile.pendingRuleChanges,
    userSession: mobile.session,
    blocker,
  })
}
