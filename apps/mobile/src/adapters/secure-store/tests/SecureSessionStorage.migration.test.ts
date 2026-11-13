import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SecureSessionStorage } from '../SecureSessionStorage'
import {
  ignoreWritesToKey,
  rejectWriteNumber,
  resetSecureStoreFake,
  secureStoreContents,
  setItemAsync,
  tokens,
} from './secureStoreFake'

vi.mock('expo-secure-store', async () => (await import('./secureStoreFake')).secureStoreModule)

const legacySession = JSON.stringify(tokens)

describe('SecureSessionStorage legacy migration', () => {
  beforeEach(() => {
    resetSecureStoreFake()
    secureStoreContents.set('block_apps_tokens', legacySession)
  })

  it('removes the legacy session only after confirming the new keys', async () => {
    expect(await new SecureSessionStorage().load()).toEqual(tokens)

    expect(secureStoreContents.has('block_apps_tokens')).toBe(false)
    expect(secureStoreContents.get('block_apps_refresh_token')).toBe('c')
  })

  it('keeps the legacy session and stays signed in when the write fails', async () => {
    rejectWriteNumber(2)

    expect(await new SecureSessionStorage().load()).toEqual(tokens)

    expect(secureStoreContents.get('block_apps_tokens')).toBe(legacySession)
    expect(secureStoreContents.has('block_apps_access_token')).toBe(false)
  })

  it('keeps the legacy session when the new keys cannot be confirmed', async () => {
    ignoreWritesToKey('block_apps_refresh_token')

    expect(await new SecureSessionStorage().load()).toEqual(tokens)

    expect(secureStoreContents.get('block_apps_tokens')).toBe(legacySession)
  })

  it.each([
    ['text that is not json', 'not-json'],
    ['a session without the refresh token', JSON.stringify({ ...tokens, refreshToken: '' })],
    ['a session with a non text field', JSON.stringify({ ...tokens, email: 42 })],
    ['a json value that is not an object', 'null'],
  ])('ignores a legacy session made of %s', async (_description, invalidSession) => {
    secureStoreContents.set('block_apps_tokens', invalidSession)

    expect(await new SecureSessionStorage().load()).toBeNull()

    expect(secureStoreContents.get('block_apps_tokens')).toBe(invalidSession)
    expect(setItemAsync).not.toHaveBeenCalled()
  })
})
