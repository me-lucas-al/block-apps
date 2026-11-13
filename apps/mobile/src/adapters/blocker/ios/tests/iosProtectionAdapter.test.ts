import { describe, expect, it } from 'vitest'
import { createIosAdapters } from '../createIosAdapters'
import { buildNativeModule } from './iosTestKit'

describe('iOS protection adapter', () => {
  it('is protected only when Screen Time is authorized', () => {
    const approved = createIosAdapters(buildNativeModule()).protection
    const denied = createIosAdapters(
      buildNativeModule({ getAuthorizationStatus: () => 'denied' }),
    ).protection
    expect(approved.isDeviceProtected()).toBe(true)
    expect(denied.isDeviceProtected()).toBe(false)
  })

  it('asks for authorization from the protection check action', () => {
    const nativeModule = buildNativeModule({ getAuthorizationStatus: () => 'notDetermined' })
    const [authorizationCheck] = createIosAdapters(nativeModule).protection.listChecks()
    expect(authorizationCheck?.active).toBe(false)
    authorizationCheck?.performAction()
    expect(nativeModule.requestScreenTimeAuthorization).toHaveBeenCalledOnce()
  })
})
