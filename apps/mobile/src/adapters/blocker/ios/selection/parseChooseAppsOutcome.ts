import type { ChooseAppsOutcome } from '../../../../ports/groupselection/GroupSelectionPort'

export function parseChooseAppsOutcome(nativeOutcome: string): ChooseAppsOutcome {
  if (nativeOutcome === 'saved') return nativeOutcome
  if (nativeOutcome === 'removalPending') return nativeOutcome
  if (nativeOutcome === 'cancelled') return nativeOutcome
  throw new Error(`Unexpected app selection outcome: ${nativeOutcome}`)
}
