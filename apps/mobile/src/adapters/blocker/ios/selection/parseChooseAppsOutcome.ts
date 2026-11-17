import type { ChooseAppsOutcome } from '../../../../ports/groupselection/GroupSelectionPort'

const KNOWN_OUTCOMES: readonly ChooseAppsOutcome[] = [
  'saved',
  'removalPending',
  'cancelled',
  'notAuthorized',
  'notOwner',
]

export function parseChooseAppsOutcome(nativeOutcome: string): ChooseAppsOutcome {
  const knownOutcome = KNOWN_OUTCOMES.find((outcome) => outcome === nativeOutcome)
  if (knownOutcome) return knownOutcome
  throw new Error(`Unexpected app selection outcome: ${nativeOutcome}`)
}
