import type { BlockRuleRepository, PendingRuleChangeRepository } from '@block-apps/api'
import type { BlockRule, PendingRuleChange } from '@block-apps/core'

export type SelectionRemovalHolderDependencies = {
  readonly ruleRepository: Pick<BlockRuleRepository, 'requestUpdate'>
  readonly pendingRuleChanges: Pick<
    PendingRuleChangeRepository,
    'listPendingChanges' | 'cancelPendingChange'
  >
}

const REMOVAL_REQUEST_BLOCKS_EDITING =
  'Cancele o pedido de remoção do grupo antes de editar os apps.'

export class SelectionRemovalHolder {
  constructor(private readonly dependencies: SelectionRemovalHolderDependencies) {}

  async holdRemovalOf(rule: BlockRule): Promise<PendingRuleChange> {
    const { ruleRepository, pendingRuleChanges } = this.dependencies
    const pendingChanges = await pendingRuleChanges.listPendingChanges()
    const existing = pendingChanges.find((change) => change.ruleId === rule.id)
    if (existing?.kind === 'delete') throw new Error(REMOVAL_REQUEST_BLOCKS_EDITING)
    if (existing) await pendingRuleChanges.cancelPendingChange(rule.id)
    return ruleRepository.requestUpdate(rule.id, { mode: rule.mode, windows: rule.windows })
  }
}
