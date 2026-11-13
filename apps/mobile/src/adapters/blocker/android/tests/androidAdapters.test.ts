import type { BlockRule } from '@block-apps/core'
import { describe, expect, it, vi } from 'vitest'
import type { AndroidNativeModule } from '../module/AndroidNativeModule'
import { createAndroidAdapters } from '../createAndroidAdapters'

const appRule: BlockRule = {
  id: 'rule-1',
  targetType: 'app',
  target: 'com.instagram.android',
  mode: 'always',
  windows: [],
}

function buildNativeModule(overrides: Partial<AndroidNativeModule> = {}): AndroidNativeModule {
  return {
    setRules: vi.fn(),
    isAccessibilityEnabled: () => false,
    openAccessibilitySettings: vi.fn(),
    isDeviceAdminActive: () => false,
    requestDeviceAdmin: vi.fn(),
    listLaunchableApps: () => [],
    ...overrides,
  }
}

describe('createAndroidAdapters', () => {
  it('serializes app rules to the native module', () => {
    const nativeModule = buildNativeModule()
    createAndroidAdapters(nativeModule).blocker.applyRules([appRule], [])
    expect(nativeModule.setRules).toHaveBeenCalledWith(
      '[{"target":"com.instagram.android","mode":"always","windows":[]}]',
    )
  })

  it('lists installed apps from the native module', () => {
    const installed = [{ packageName: 'com.a', label: 'A' }]
    const nativeModule = buildNativeModule({ listLaunchableApps: () => installed })
    expect(createAndroidAdapters(nativeModule).appChoice.listInstalledApps()).toEqual(installed)
  })

  it('exposes accessibility and device admin as protection checks', () => {
    const nativeModule = buildNativeModule({ isDeviceAdminActive: () => true })
    const checks = createAndroidAdapters(nativeModule).protection.listChecks()
    expect(checks.map((check) => [check.id, check.active])).toEqual([
      ['accessibility', false],
      ['device-admin', true],
    ])
  })

  it('runs the native action of each protection check', () => {
    const nativeModule = buildNativeModule()
    const [accessibility, deviceAdmin] = createAndroidAdapters(nativeModule).protection.listChecks()
    accessibility?.performAction()
    deviceAdmin?.performAction()
    expect(nativeModule.openAccessibilitySettings).toHaveBeenCalledOnce()
    expect(nativeModule.requestDeviceAdmin).toHaveBeenCalledOnce()
  })

  it('reports the device as protected only when device admin is active', () => {
    const inactive = createAndroidAdapters(buildNativeModule()).protection
    const active = createAndroidAdapters(
      buildNativeModule({ isDeviceAdminActive: () => true }),
    ).protection
    expect(inactive.isDeviceProtected()).toBe(false)
    expect(active.isDeviceProtected()).toBe(true)
  })
})
