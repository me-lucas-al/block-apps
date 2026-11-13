import { describe, expect, it, vi } from 'vitest'
import type { Authenticator } from '../../src/auth/Authenticator'
import { SessionRevocationError } from '../../src/auth/SessionRevocationError'
import { SESSION_NOT_REVOKED_NOTICE, SignOutUseCase } from '../../src/auth/SignOutUseCase'

function buildUseCase(signOut: () => Promise<void>): SignOutUseCase {
  return new SignOutUseCase({ signOut } as unknown as Authenticator)
}

describe('SignOutUseCase', () => {
  it('reports a clean sign out', async () => {
    const outcome = await buildUseCase(vi.fn().mockResolvedValue(undefined)).signOut()

    expect(outcome).toEqual({ revokedOnServer: true })
  })

  it('warns that the token was not invalidated when the revocation fails', async () => {
    const failedRevocation = vi.fn().mockRejectedValue(new SessionRevocationError('offline'))

    const outcome = await buildUseCase(failedRevocation).signOut()

    expect(outcome).toEqual({ revokedOnServer: false, notice: SESSION_NOT_REVOKED_NOTICE })
  })

  it('explains other failures instead of hiding them', async () => {
    const failedRead = vi.fn().mockRejectedValue(new Error('read failed'))

    const outcome = await buildUseCase(failedRead).signOut()

    expect(outcome).toEqual({
      revokedOnServer: false,
      notice: 'Não foi possível concluir o logout: read failed',
    })
  })
})
