import { vi } from 'vitest'

export const secureStoreContents = new Map<string, string>()
export const getItemAsync = vi.fn()
export const setItemAsync = vi.fn()

export const secureStoreModule = {
  getItemAsync: (key: string) => getItemAsync(key),
  setItemAsync: (key: string, storedValue: string) => setItemAsync(key, storedValue),
  deleteItemAsync: async (key: string) => {
    secureStoreContents.delete(key)
  },
}

export const tokens = { accessToken: 'a', idToken: 'b', refreshToken: 'c', email: 'm@test.com' }
export const refreshedTokens = {
  accessToken: 'a2',
  idToken: 'b2',
  refreshToken: 'c2',
  email: 'm@test.com',
}

function writeToFakeStore(key: string, storedValue: string): void {
  secureStoreContents.set(key, storedValue)
}

export function resetSecureStoreFake(): void {
  secureStoreContents.clear()
  getItemAsync.mockReset()
  setItemAsync.mockReset()
  getItemAsync.mockImplementation(async (key: string) => secureStoreContents.get(key) ?? null)
  setItemAsync.mockImplementation(async (key: string, storedValue: string) =>
    writeToFakeStore(key, storedValue),
  )
}

export function rejectWriteNumber(callNumber: number): void {
  let calls = 0
  setItemAsync.mockImplementation(async (key: string, storedValue: string) => {
    calls += 1
    if (calls === callNumber) throw new Error('value too large')
    writeToFakeStore(key, storedValue)
  })
}

export function ignoreWritesToKey(ignoredKey: string): void {
  setItemAsync.mockImplementation(async (key: string, storedValue: string) => {
    if (key !== ignoredKey) writeToFakeStore(key, storedValue)
  })
}
