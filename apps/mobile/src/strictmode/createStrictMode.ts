import type { BlockRuleRepository, PendingRuleChangeRepository } from '@block-apps/api'
import type { StrictModeAcceptancePort } from '../ports/strictmode/StrictModeAcceptancePort'
import type { AppRulesSync } from '../sync/AppRulesSync'
import { StrictModeController } from './StrictModeController'

type StrictModeSources = {
  readonly platform: string
  readonly isEnabledByBuild: boolean
  readonly ruleRepository: BlockRuleRepository
  readonly pendingRuleChanges: PendingRuleChangeRepository
  readonly rulesSync: AppRulesSync
  readonly isScreenTimeAuthorized: () => boolean
  readonly deviceAcceptance: StrictModeAcceptancePort | null
}

export function createStrictMode(sources: StrictModeSources): StrictModeController | null {
  if (!sources.isEnabledByBuild) return null
  if (sources.platform !== 'ios') return null
  if (!sources.deviceAcceptance) return null
  return new StrictModeController({
    ruleRepository: sources.ruleRepository,
    pendingRuleChanges: sources.pendingRuleChanges,
    syncRulesToDevice: () => sources.rulesSync.sync(),
    isScreenTimeAuthorized: sources.isScreenTimeAuthorized,
    deviceAcceptance: sources.deviceAcceptance,
  })
}
