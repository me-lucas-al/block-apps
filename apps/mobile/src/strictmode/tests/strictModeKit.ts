import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import { StrictModeController } from '../StrictModeController'

export const STRICT_RULE: BlockRule = {
  id: 'protection~ios-deny-app-removal',
  targetType: 'protection',
  target: 'ios-deny-app-removal',
  mode: 'always',
  windows: [],
}

export function buildKit(
  rules: BlockRule[],
  pendingChanges: PendingRuleChange[] = [],
  isScreenTimeAuthorized = true,
) {
  const calls: string[] = []
  const controller = new StrictModeController({
    ruleRepository: {
      list: async () => rules,
      create: async (newRule) => {
        calls.push(`create:${newRule.targetType}:${newRule.target}:${newRule.mode}`)
        return { ...newRule, id: 'new' }
      },
    },
    pendingRuleChanges: {
      listPendingChanges: async () => pendingChanges,
      requestRemoval: async (ruleId) => {
        calls.push(`remove:${ruleId}`)
        return { id: ruleId, ruleId, kind: 'delete', mode: null, windows: null, effectiveAt: 'x' }
      },
      cancelPendingChange: async (ruleId) => {
        calls.push(`cancel:${ruleId}`)
      },
    },
    syncRulesToDevice: async () => {
      calls.push('sync')
    },
    isScreenTimeAuthorized: () => isScreenTimeAuthorized,
  })
  return { controller, calls }
}


export const REMOVAL: PendingRuleChange = {
  id: STRICT_RULE.id,
  ruleId: STRICT_RULE.id,
  kind: 'delete',
  mode: null,
  windows: null,
  effectiveAt: '2026-11-16T12:00:00.000Z',
}
