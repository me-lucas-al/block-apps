import { vi } from 'vitest'
import type { CognitoAccountOps } from '../../src/auth/cognito/CognitoAccountOps'
import { CognitoSessionManager } from '../../src/auth/cognito/CognitoSessionManager'
import type { CognitoTokenRevoker } from '../../src/auth/cognito/CognitoTokenRevoker'
import type { SessionTokens } from '../../src/auth/contracts/SessionTokens'
import { LocalUserSession } from '../../src/auth/session/LocalUserSession'
import { MemorySessionStorage } from '../../src/auth/storage/MemorySessionStorage'

export const storedTokens: SessionTokens = {
  accessToken: 'old-access',
  idToken: 'old-id',
  refreshToken: 'refresh-1',
  email: 'user@example.com',
}

export async function makeHarness(
  refreshSession: CognitoAccountOps['refreshSession'],
  revokeRefreshToken: CognitoTokenRevoker['revokeRefreshToken'] = vi.fn(),
) {
  const storage = new MemorySessionStorage()
  await storage.save(storedTokens)
  const clearCachedSession = vi.fn()
  const accountOps = { refreshSession, clearCachedSession } as unknown as CognitoAccountOps
  const tokenRevoker = { revokeRefreshToken } as unknown as CognitoTokenRevoker
  const manager = new CognitoSessionManager(
    storage,
    new LocalUserSession(storage),
    accountOps,
    tokenRevoker,
  )
  return { storage, manager, clearCachedSession, revokeRefreshToken }
}
