import type { BlockRuleRepository, PendingRuleChangeRepository } from '@block-apps/api'
import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import {
  PendingRuleEditBlocksRemovalError,
  RemovalRequestBlocksEditingError,
} from './selectionRemovalErrors'

export type SelectionRemovalHolderDependencies = {
  readonly ruleRepository: Pick<BlockRuleRepository, 'requestSelectionRemoval'>
  readonly pendingRuleChanges: Pick<
    PendingRuleChangeRepository,
    'listPendingChanges' | 'cancelPendingChange'
  >
}

export class SelectionRemovalHolder {
  constructor(private readonly dependencies: SelectionRemovalHolderDependencies) {}

  async holdRemovalOf(rule: BlockRule): Promise<PendingRuleChange> {
    const { ruleRepository, pendingRuleChanges } = this.dependencies
    const pendingChanges = await pendingRuleChanges.listPendingChanges()
    const existing = pendingChanges.find((change) => change.ruleId === rule.id)
    if (existing?.kind === 'delete') throw new RemovalRequestBlocksEditingError()
    if (existing?.kind === 'update') throw new PendingRuleEditBlocksRemovalError()
    if (existing) await pendingRuleChanges.cancelPendingChange(rule.id)
    return ruleRepository.requestSelectionRemoval(rule.id)
  }
}
