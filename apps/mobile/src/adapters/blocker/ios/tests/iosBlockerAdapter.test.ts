import { describe, expect, it, vi } from 'vitest'
import { createIosAdapters } from '../createIosAdapters'
import { androidRule, buildNativeModule, groupRule, pendingUpdate, siteRule } from './iosTestKit'

describe('iOS blocker adapter', () => {
  it('sends ios selections, sites and protections with ids to the native module', () => {
    const nativeModule = buildNativeModule()
    createIosAdapters(nativeModule).blocker.applyRules([groupRule, siteRule, androidRule], [])
    const sentRules: unknown = JSON.parse(vi.mocked(nativeModule.setRules).mock.calls[0]?.[0] ?? '')
    expect(sentRules).toEqual([
      { id: groupRule.id, targetType: 'iosSelection', target: 'social', mode: 'always', windows: [] },
      { id: siteRule.id, targetType: 'site', target: 'x.com', mode: 'always', windows: [] },
    ])
  })

  it('commits a held selection removal once its cooldown change is gone', () => {
    const nativeModule = buildNativeModule({ hasPendingSelectionRemoval: () => true })
    createIosAdapters(nativeModule).blocker.applyRules([groupRule], [])
    expect(nativeModule.commitPendingSelection).toHaveBeenCalledWith(groupRule.id)
  })

  it('keeps a held selection removal while the cooldown change is pending', () => {
    const nativeModule = buildNativeModule({ hasPendingSelectionRemoval: () => true })
    createIosAdapters(nativeModule).blocker.applyRules([groupRule], [pendingUpdate])
    expect(nativeModule.commitPendingSelection).not.toHaveBeenCalled()
  })

  it('reapplies the shields natively when refreshing in the background', () => {
    const nativeModule = buildNativeModule()
    const adapters = createIosAdapters(nativeModule)
    adapters.blocker.refreshEnforcement()
    expect(nativeModule.reapplyShields).toHaveBeenCalledOnce()
    expect(adapters.needsBackgroundRefresh).toBe(true)
  })
})
