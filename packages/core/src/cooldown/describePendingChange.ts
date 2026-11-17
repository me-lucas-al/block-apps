import type { PendingChangeKind, PendingRuleChange } from '../rules/pendingRuleChange'
import { formatRemaining } from './formatRemaining'

const KIND_LABELS: Readonly<Record<PendingChangeKind, string>> = {
  update: 'Alteração',
  delete: 'Remoção',
  selectionRemoval: 'Remoção de apps',
}

function describeKind(kind: PendingChangeKind): string {
  return KIND_LABELS[kind]
}

export function describePendingChange(change: PendingRuleChange, now: Date): string {
  const label = describeKind(change.kind)
  return `${label} em ${formatRemaining(change.effectiveAt, now)}`
}
