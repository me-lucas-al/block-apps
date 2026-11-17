import { describe, expect, it, vi } from 'vitest'
import { createIosAdapters } from '../createIosAdapters'
import { androidRule, buildNativeModule, groupRule, pendingUpdate, siteRule } from './iosTestKit'

function buildHeldRemovalModule(holdEffectiveAt: string | null) {
  return buildNativeModule({
    hasPendingSelectionRemoval: () => true,
    getPendingSelectionHold: () => holdEffectiveAt,
  })
}

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

  it('commits a held removal once the cooldown ended and the change is gone', () => {
    const nativeModule = buildHeldRemovalModule('2020-01-01T00:00:00.000Z')
    createIosAdapters(nativeModule).blocker.applyRules([groupRule], [])
    expect(nativeModule.commitPendingSelection).toHaveBeenCalledWith(groupRule.id)
  })

  it('keeps a held removal while the cooldown change is still pending', () => {
    const nativeModule = buildHeldRemovalModule('2020-01-01T00:00:00.000Z')
    createIosAdapters(nativeModule).blocker.applyRules([groupRule], [pendingUpdate])
    expect(nativeModule.commitPendingSelection).not.toHaveBeenCalled()
    expect(nativeModule.discardPendingSelection).not.toHaveBeenCalled()
  })

  it('discards a held removal whose change vanished before the cooldown ended', () => {
    const nativeModule = buildHeldRemovalModule('2999-01-01T00:00:00.000Z')
    createIosAdapters(nativeModule).blocker.applyRules([groupRule], [])
    expect(nativeModule.discardPendingSelection).toHaveBeenCalledWith(groupRule.id)
    expect(nativeModule.commitPendingSelection).not.toHaveBeenCalled()
  })

  it('never commits a pending removal that was not held by a cooldown change', () => {
    const nativeModule = buildHeldRemovalModule(null)
    createIosAdapters(nativeModule).blocker.applyRules([groupRule], [])
    expect(nativeModule.commitPendingSelection).not.toHaveBeenCalled()
  })

  it('reapplies the shields natively when refreshing in the background', () => {
    const nativeModule = buildNativeModule()
    const adapters = createIosAdapters(nativeModule)
    adapters.blocker.refreshEnforcement()
    expect(nativeModule.reapplyShields).toHaveBeenCalledOnce()
  })
})
