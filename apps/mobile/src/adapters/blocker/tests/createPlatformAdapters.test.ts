import { describe, expect, it } from 'vitest'
import type { AndroidNativeModule } from '../android/module/AndroidNativeModule'
import { createPlatformAdapters } from '../createPlatformAdapters'
import type { IosNativeModule } from '../ios/module/IosNativeModule'

const nativeModule: AndroidNativeModule & IosNativeModule = {
  setRules: async () => undefined,
  isAccessibilityEnabled: () => true,
  openAccessibilitySettings: () => undefined,
  isDeviceAdminActive: () => true,
  requestDeviceAdmin: () => undefined,
  listLaunchableApps: () => [],
  getAuthorizationStatus: () => 'approved',
  requestScreenTimeAuthorization: async () => 'approved',
  presentAppSelectionPicker: async () => 'saved',
  getGroupStates: async () => ({
    chosenRuleIds: [],
    unreadableRuleIds: [],
    unscheduledRuleIds: [],
    oversizedRuleIds: [],
  }),
  holdPendingSelection: () => undefined,
  discardPendingSelection: () => undefined,
  hasAcceptedStrictMode: () => false,
  acceptStrictMode: () => undefined,
  revokeStrictMode: () => undefined,
  reapplyShields: async () => undefined,
  recordAppOpened: async () => undefined,
}

describe('createPlatformAdapters', () => {
  it('builds the android adapters on android', () => {
    const adapters = createPlatformAdapters({ platformOs: 'android', nativeModule, currentOwnerId: async () => 'owner-sub' })
    expect(adapters.platform).toBe('android')
    expect(adapters.listedTargetTypes).toEqual(['app', 'keyword'])
    expect(adapters.groupSelection).toBeNull()
  })

  it('builds the ios adapters on ios', () => {
    const adapters = createPlatformAdapters({ platformOs: 'ios', nativeModule, currentOwnerId: async () => 'owner-sub' })
    expect(adapters.platform).toBe('ios')
    expect(adapters.listedTargetTypes).toEqual(['iosSelection'])
    expect(adapters.groupSelection).not.toBeNull()
  })

  it('rejects platforms without adapters', () => {
    expect(() => createPlatformAdapters({ platformOs: 'web', nativeModule, currentOwnerId: async () => 'owner-sub' })).toThrow(
      'Unsupported platform: web',
    )
  })
})
