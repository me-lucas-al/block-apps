import type { PendingRuleChange } from '../rules/types'
import { formatRemaining } from './remainingTime'

export function describePendingChange(change: PendingRuleChange, now: Date): string {
  const label = change.kind === 'delete' ? 'Remoção' : 'Alteração'
  return `${label} em ${formatRemaining(change.effectiveAt, now)}`
}
