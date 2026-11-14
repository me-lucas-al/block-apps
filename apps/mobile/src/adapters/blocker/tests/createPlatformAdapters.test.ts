import { describe, expect, it } from 'vitest'
import type { AndroidNativeModule } from '../android/AndroidNativeModule'
import { createPlatformAdapters } from '../createPlatformAdapters'

const androidModule: AndroidNativeModule = {
  setRules: () => undefined,
  isAccessibilityEnabled: () => true,
  openAccessibilitySettings: () => undefined,
  isDeviceAdminActive: () => true,
  requestDeviceAdmin: () => undefined,
  listLaunchableApps: () => [],
}

describe('createPlatformAdapters', () => {
  it('builds the android adapters on android', () => {
    const adapters = createPlatformAdapters({ platformOs: 'android', androidModule })
    expect(adapters.platform).toBe('android')
  })

  it('rejects platforms without adapters', () => {
    expect(() => createPlatformAdapters({ platformOs: 'web', androidModule })).toThrow(
      'Unsupported platform: web',
    )
  })
})
