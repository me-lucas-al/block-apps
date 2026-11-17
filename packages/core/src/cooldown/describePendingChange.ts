import type { PendingChangeKind, PendingRuleChange } from '../rules/pendingRuleChange'
import { formatRemaining } from './formatRemaining'

const KIND_LABELS: Readonly<Record<PendingChangeKind, string>> = {
  update: 'Alteração',
  delete: 'Remoção',
  selectionRemoval: 'Remoção de apps',
}

export function describePendingChange(change: PendingRuleChange, now: Date): string {
  const label = KIND_LABELS[change.kind]
  return `${label} em ${formatRemaining(change.effectiveAt, now)}`
}
