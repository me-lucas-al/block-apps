import type { BlockRuleRepository, PendingRuleChangeRepository } from '@block-apps/api'
import type { AppRulesSync } from '../sync/AppRulesSync'
import { StrictModeController } from './StrictModeController'

type StrictModeSources = {
  readonly platform: string
  readonly ruleRepository: BlockRuleRepository
  readonly pendingRuleChanges: PendingRuleChangeRepository
  readonly rulesSync: AppRulesSync
  readonly isScreenTimeAuthorized: () => boolean
}

export function createStrictMode(sources: StrictModeSources): StrictModeController | null {
  if (sources.platform !== 'ios') return null
  return new StrictModeController({
    ruleRepository: sources.ruleRepository,
    pendingRuleChanges: sources.pendingRuleChanges,
    syncRulesToDevice: () => sources.rulesSync.sync(),
    isScreenTimeAuthorized: sources.isScreenTimeAuthorized,
  })
}
