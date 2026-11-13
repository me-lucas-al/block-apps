import { describe, expect, it, vi } from 'vitest'
import { syncRulesInBackground } from '../syncRulesInBackground'

describe('syncRulesInBackground', () => {
  it('reports success after syncing the rules', async () => {
    const sync = vi.fn().mockResolvedValue(undefined)

    const outcome = await syncRulesInBackground(() => ({ sync }))

    expect(sync).toHaveBeenCalledOnce()
    expect(outcome).toBe('success')
  })

  it('reports failure when the sync rejects', async () => {
    const sync = vi.fn().mockRejectedValue(new Error('offline'))

    expect(await syncRulesInBackground(() => ({ sync }))).toBe('failed')
  })

  it('reports failure when building the sync throws', async () => {
    const failingFactory = () => {
      throw new Error('Missing client configuration: EXPO_PUBLIC_API_URL')
    }

    expect(await syncRulesInBackground(failingFactory)).toBe('failed')
  })
})
