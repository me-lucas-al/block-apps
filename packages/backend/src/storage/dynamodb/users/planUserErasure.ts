import { listDnsLookupKeys } from '../dns/listDnsLookupKeys'

type StoredKey = Record<string, unknown>

export type UserErasurePlan = {
  readonly lookupKeys: StoredKey[]
  readonly userKeys: StoredKey[]
}

export function planUserErasure(storedEntries: StoredKey[]): UserErasurePlan {
  const userKeys = storedEntries.map((storedEntry) => ({
    pk: storedEntry['pk'],
    sk: storedEntry['sk'],
  }))
  return { lookupKeys: listDnsLookupKeys(storedEntries), userKeys }
}
