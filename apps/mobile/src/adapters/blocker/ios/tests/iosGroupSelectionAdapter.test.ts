import { describe, expect, it, vi } from 'vitest'
import { createIosAdapters } from '../createIosAdapters'
import { buildNativeModule, groupRule, signedInOwner, signedOutOwner } from './iosTestKit'

describe('iOS group selection adapter', () => {
  it('returns the outcome reported by the picker', async () => {
    const nativeModule = buildNativeModule({ presentAppSelectionPicker: async () => 'removalPending' })
    const { groupSelection } = createIosAdapters(nativeModule, signedInOwner)
    await expect(groupSelection?.chooseApps(groupRule.id)).resolves.toBe('removalPending')
  })

  it('opens the picker on behalf of the signed in owner', async () => {
    const nativeModule = buildNativeModule()
    await createIosAdapters(nativeModule, signedInOwner).groupSelection?.chooseApps(groupRule.id)
    expect(nativeModule.presentAppSelectionPicker).toHaveBeenCalledWith(groupRule.id, 'owner-sub')
  })

  it('does not open the picker without a signed in owner', async () => {
    const nativeModule = buildNativeModule()
    const { groupSelection } = createIosAdapters(nativeModule, signedOutOwner)
    await expect(groupSelection?.chooseApps(groupRule.id)).resolves.toBe('notOwner')
    expect(nativeModule.presentAppSelectionPicker).not.toHaveBeenCalled()
  })

  it('reports when another account owns the rules', async () => {
    const nativeModule = buildNativeModule({ presentAppSelectionPicker: async () => 'notOwner' })
    const { groupSelection } = createIosAdapters(nativeModule, signedInOwner)
    await expect(groupSelection?.chooseApps(groupRule.id)).resolves.toBe('notOwner')
  })

  it('rejects an outcome it does not know', async () => {
    const nativeModule = buildNativeModule({ presentAppSelectionPicker: async () => 'weird' })
    const { groupSelection } = createIosAdapters(nativeModule, signedInOwner)
    await expect(groupSelection?.chooseApps(groupRule.id)).rejects.toThrow('weird')
  })

  it('holds a removal on behalf of the owner', async () => {
    const nativeModule = buildNativeModule()
    const { groupSelection } = createIosAdapters(nativeModule, signedInOwner)
    await groupSelection?.holdPendingRemoval(groupRule.id, '2026-11-17T00:00:00.000Z')
    expect(nativeModule.holdPendingSelection).toHaveBeenCalledWith(
      groupRule.id,
      '2026-11-17T00:00:00.000Z',
      'owner-sub',
    )
  })

  it('refuses to hold a removal without a signed in owner', async () => {
    const nativeModule = buildNativeModule()
    const { groupSelection } = createIosAdapters(nativeModule, signedOutOwner)
    await expect(groupSelection?.holdPendingRemoval(groupRule.id, 'x')).rejects.toThrow('Entre na sua conta')
    expect(vi.mocked(nativeModule.holdPendingSelection)).not.toHaveBeenCalled()
  })

  it('lists no installed apps because iOS only exposes opaque tokens', () => {
    const adapters = createIosAdapters(buildNativeModule(), signedInOwner)
    expect(adapters.appChoice.listInstalledApps()).toEqual([])
  })
})
