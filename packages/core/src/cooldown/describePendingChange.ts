import type { PendingRuleChange } from '../rules/pendingRuleChange'
import { formatRemaining } from './formatRemaining'

export function describePendingChange(change: PendingRuleChange, now: Date): string {
  const label = change.kind === 'delete' ? 'Remoção' : 'Alteração'
  return `${label} em ${formatRemaining(change.effectiveAt, now)}`
}
