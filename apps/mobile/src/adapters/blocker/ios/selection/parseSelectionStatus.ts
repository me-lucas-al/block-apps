import type { SelectionStatus } from '../../../../ports/groupselection/GroupSelectionPort'

const KNOWN_STATUSES: readonly SelectionStatus[] = ['absent', 'unreadable', 'found']

export function parseSelectionStatus(nativeStatus: string): SelectionStatus {
  const knownStatus = KNOWN_STATUSES.find((status) => status === nativeStatus)
  if (knownStatus) return knownStatus
  throw new Error(`Unexpected selection status: ${nativeStatus}`)
}
