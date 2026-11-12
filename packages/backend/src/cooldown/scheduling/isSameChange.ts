import type { PendingRuleChange, TimeWindow } from '@block-apps/core'
import type { ChangeDraft } from './ChangeDraft'

function describeWindows(windows: readonly TimeWindow[] | null): string[] {
  return (windows ?? []).map(
    (window) => `${[...window.days].sort().join(',')}|${window.start}|${window.end}`,
  )
}

export function isSameChange(pending: PendingRuleChange, draft: ChangeDraft): boolean {
  if (pending.kind !== draft.kind) return false
  if (draft.kind === 'delete') return true
  return (
    pending.mode === draft.mode &&
    describeWindows(pending.windows).join(';') === describeWindows(draft.windows).join(';')
  )
}
