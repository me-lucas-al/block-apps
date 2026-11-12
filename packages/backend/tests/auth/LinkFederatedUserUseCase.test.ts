import { describe, expect, it, vi } from 'vitest'
import {
  LinkFederatedUserUseCase,
  type UserDirectoryLookup,
} from '../../src/auth/use-cases/LinkFederatedUserUseCase'

describe('LinkFederatedUserUseCase', () => {
  function makeHarness() {
    const directory: UserDirectoryLookup = {
      findNativeUserByEmail: vi.fn(),
      linkProvider: vi.fn(),
    }
    const useCase = new LinkFederatedUserUseCase(directory)
    return { directory, useCase }
  }

  it('links Google user when native user with same verified email exists', async () => {
    const { directory, useCase } = makeHarness()
    vi.mocked(directory.findNativeUserByEmail).mockResolvedValue({ username: 'native-user-id' })

    const outcome = await useCase.link({
      triggerSource: 'PreSignUp_ExternalProvider',
      userPoolId: 'pool-1',
      userName: 'Google_123456789',
      email: 'user@example.com',
      emailVerified: true,
    })

    expect(outcome).toEqual({ linked: true, autoConfirm: false })
    expect(directory.findNativeUserByEmail).toHaveBeenCalledWith('pool-1', 'user@example.com')
    expect(directory.linkProvider).toHaveBeenCalledWith({
      userPoolId: 'pool-1',
      destinationUsername: 'native-user-id',
      providerName: 'Google',
      providerUserId: '123456789',
    })
  })

  it('auto-confirms new federated user when no native user exists', async () => {
    const { directory, useCase } = makeHarness()
    vi.mocked(directory.findNativeUserByEmail).mockResolvedValue(null)

    const outcome = await useCase.link({
      triggerSource: 'PreSignUp_ExternalProvider',
      userPoolId: 'pool-1',
      userName: 'Google_123456789',
      email: 'user@example.com',
      emailVerified: true,
    })

    expect(outcome).toEqual({ linked: false, autoConfirm: true })
    expect(directory.linkProvider).not.toHaveBeenCalled()
  })
})
