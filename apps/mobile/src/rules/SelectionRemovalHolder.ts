import type { BlockRuleRepository, PendingRuleChangeRepository } from '@block-apps/api'
import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import {
  PendingRuleEditBlocksRemovalError,
  RemovalRequestBlocksEditingError,
} from './selectionRemovalErrors'

export type SelectionRemovalHolderDependencies = {
  readonly ruleRepository: Pick<BlockRuleRepository, 'requestUpdate'>
  readonly pendingRuleChanges: Pick<
    PendingRuleChangeRepository,
    'listPendingChanges' | 'cancelPendingChange'
  >
}

function isRemovalRequestOf(rule: BlockRule, change: PendingRuleChange): boolean {
  if (change.kind !== 'update') return false
  const sameMode = change.mode === rule.mode
  const sameWindows = JSON.stringify(change.windows) === JSON.stringify(rule.windows)
  return sameMode && sameWindows
}

export class SelectionRemovalHolder {
  constructor(private readonly dependencies: SelectionRemovalHolderDependencies) {}

  async holdRemovalOf(rule: BlockRule): Promise<PendingRuleChange> {
    const { ruleRepository, pendingRuleChanges } = this.dependencies
    const pendingChanges = await pendingRuleChanges.listPendingChanges()
    const existing = pendingChanges.find((change) => change.ruleId === rule.id)
    if (existing?.kind === 'delete') throw new RemovalRequestBlocksEditingError()
    if (existing && !isRemovalRequestOf(rule, existing)) {
      throw new PendingRuleEditBlocksRemovalError()
    }
    if (existing) await pendingRuleChanges.cancelPendingChange(rule.id)
    return ruleRepository.requestUpdate(rule.id, { mode: rule.mode, windows: rule.windows })
  }
}
