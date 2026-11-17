import { describe, expect, it } from 'vitest'
import { createIosAdapters } from '../createIosAdapters'
import { buildNativeModule, groupRule } from './iosTestKit'

describe('iOS group selection adapter', () => {
  it('returns the outcome reported by the picker', async () => {
    const nativeModule = buildNativeModule({ presentAppSelectionPicker: async () => 'removalPending' })
    const { groupSelection } = createIosAdapters(nativeModule)
    await expect(groupSelection?.chooseApps(groupRule.id)).resolves.toBe('removalPending')
  })

  it('rejects an outcome it does not know', async () => {
    const nativeModule = buildNativeModule({ presentAppSelectionPicker: async () => 'weird' })
    const { groupSelection } = createIosAdapters(nativeModule)
    await expect(groupSelection?.chooseApps(groupRule.id)).rejects.toThrow('weird')
  })

  it('lists no installed apps because iOS only exposes opaque tokens', () => {
    expect(createIosAdapters(buildNativeModule()).appChoice.listInstalledApps()).toEqual([])
  })
})
