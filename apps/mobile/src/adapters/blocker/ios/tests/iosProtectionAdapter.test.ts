import { describe, expect, it } from 'vitest'
import { createIosAdapters } from '../createIosAdapters'
import { buildNativeModule, signedInOwner } from './iosTestKit'

describe('iOS protection adapter', () => {
  it('is protected only when Screen Time is authorized', () => {
    const approved = createIosAdapters(buildNativeModule(), signedInOwner).protection
    const denied = createIosAdapters(
      buildNativeModule({ getAuthorizationStatus: () => 'denied' }),
      signedInOwner,
    ).protection
    expect(approved.isDeviceProtected()).toBe(true)
    expect(denied.isDeviceProtected()).toBe(false)
  })

  it('asks for authorization from the protection check action', () => {
    const nativeModule = buildNativeModule({ getAuthorizationStatus: () => 'notDetermined' })
    const [authorizationCheck] = createIosAdapters(nativeModule, signedInOwner).protection.listChecks()
    expect(authorizationCheck?.active).toBe(false)
    authorizationCheck?.performAction()
    expect(nativeModule.requestScreenTimeAuthorization).toHaveBeenCalledOnce()
  })

  it('lets an authorization failure reach the caller instead of swallowing it', async () => {
    const nativeModule = buildNativeModule({
      getAuthorizationStatus: () => 'notDetermined',
      requestScreenTimeAuthorization: async () => {
        throw new Error('authorization failed')
      },
    })
    const [authorizationCheck] = createIosAdapters(nativeModule, signedInOwner).protection.listChecks()
    await expect(authorizationCheck?.performAction()).rejects.toThrow('authorization failed')
  })
})
