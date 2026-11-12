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

    await useCase.link({
      triggerSource: 'PreSignUp_ExternalProvider',
      userPoolId: 'pool-1',
      userName: 'Google_123456789',
      email: 'user@example.com',
      emailVerified: true,
    })

    expect(directory.findNativeUserByEmail).toHaveBeenCalledWith('pool-1', 'user@example.com')
    expect(directory.linkProvider).toHaveBeenCalledWith({
      userPoolId: 'pool-1',
      destinationUsername: 'native-user-id',
      providerName: 'Google',
      providerUserId: '123456789',
    })
  })

  it('ignores events from normal sign-ups', async () => {
    const { directory, useCase } = makeHarness()
    await useCase.link({
      triggerSource: 'PreSignUp_SignUp',
      userPoolId: 'pool-1',
      userName: 'some-user',
      email: 'user@example.com',
      emailVerified: true,
    })
    expect(directory.findNativeUserByEmail).not.toHaveBeenCalled()
    expect(directory.linkProvider).not.toHaveBeenCalled()
  })

  it('ignores events where email is unverified', async () => {
    const { directory, useCase } = makeHarness()
    await useCase.link({
      triggerSource: 'PreSignUp_ExternalProvider',
      userPoolId: 'pool-1',
      userName: 'Google_123456789',
      email: 'user@example.com',
      emailVerified: false,
    })
    expect(directory.findNativeUserByEmail).not.toHaveBeenCalled()
    expect(directory.linkProvider).not.toHaveBeenCalled()
  })

  it('does nothing when no native user with that email is found', async () => {
    const { directory, useCase } = makeHarness()
    vi.mocked(directory.findNativeUserByEmail).mockResolvedValue(null)

    await useCase.link({
      triggerSource: 'PreSignUp_ExternalProvider',
      userPoolId: 'pool-1',
      userName: 'Google_123456789',
      email: 'user@example.com',
      emailVerified: true,
    })

    expect(directory.linkProvider).not.toHaveBeenCalled()
  })
})
