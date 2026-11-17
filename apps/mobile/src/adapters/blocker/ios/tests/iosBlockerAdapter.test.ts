import { describe, expect, it, vi } from 'vitest'
import { createIosAdapters } from '../createIosAdapters'
import {
  androidRule,
  buildNativeModule,
  groupRule,
  pendingUpdate,
  signedInOwner,
  siteRule,
  snapshotOf,
} from './iosTestKit'

describe('iOS blocker adapter', () => {
  it('sends ios selections, sites and protections with ids to the native module', () => {
    const nativeModule = buildNativeModule()
    const snapshot = snapshotOf([groupRule, siteRule, androidRule])
    createIosAdapters(nativeModule, signedInOwner).blocker.applyRules(snapshot)
    const sentRules: unknown = JSON.parse(
      vi.mocked(nativeModule.setRules).mock.calls[0]?.[0].rulesJson ?? '',
    )
    expect(sentRules).toEqual([
      { id: groupRule.id, targetType: 'iosSelection', target: 'social', mode: 'always', windows: [] },
      { id: siteRule.id, targetType: 'site', target: 'x.com', mode: 'always', windows: [] },
    ])
  })

  it('tells the native module which account owns the rules', () => {
    const nativeModule = buildNativeModule()
    const snapshot = snapshotOf([groupRule], [], 'owner-sub-9')
    createIosAdapters(nativeModule, signedInOwner).blocker.applyRules(snapshot)
    expect(vi.mocked(nativeModule.setRules).mock.calls[0]?.[0].ownerId).toBe('owner-sub-9')
  })

  it('hands the pending rule ids and the server time to the native module', () => {
    const nativeModule = buildNativeModule()
    const snapshot = snapshotOf([groupRule], [pendingUpdate], 'owner', '2026-11-16T12:00:00.000Z')
    createIosAdapters(nativeModule, signedInOwner).blocker.applyRules(snapshot)
    expect(nativeModule.setRules).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: 'owner',
        pendingRuleIds: [groupRule.id],
        serverNowIso: '2026-11-16T12:00:00.000Z',
      }),
    )
  })

  it('passes no server time when none was received yet', () => {
    const nativeModule = buildNativeModule()
    createIosAdapters(nativeModule, signedInOwner).blocker.applyRules(
      snapshotOf([groupRule], [], 'owner', null),
    )
    expect(vi.mocked(nativeModule.setRules).mock.calls[0]?.[0].serverNowIso).toBeNull()
  })

  it('records an app opening natively, which background syncs must not do', () => {
    const nativeModule = buildNativeModule()
    createIosAdapters(nativeModule, signedInOwner).blocker.markAppOpened()
    expect(nativeModule.recordAppOpened).toHaveBeenCalledOnce()
    expect(nativeModule.setRules).not.toHaveBeenCalled()
  })

  it('reapplies the shields natively when refreshing in the background', () => {
    const nativeModule = buildNativeModule()
    createIosAdapters(nativeModule, signedInOwner).blocker.refreshEnforcement()
    expect(nativeModule.reapplyShields).toHaveBeenCalledOnce()
  })

  it('lets a native failure reach the caller as a rejected promise', async () => {
    const nativeModule = buildNativeModule({
      setRules: vi.fn(async () => {
        throw new Error('native failed')
      }),
    })
    const blocker = createIosAdapters(nativeModule, signedInOwner).blocker
    await expect(blocker.applyRules(snapshotOf([groupRule]))).rejects.toThrow('native failed')
  })
})
