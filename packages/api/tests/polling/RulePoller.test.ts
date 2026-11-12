import { describe, expect, it, vi } from 'vitest'
import { RulePoller } from '../../src/polling/RulePoller'

describe('RulePoller', () => {
  it('notifies subscribers on pollNow', async () => {
    const poll = vi.fn().mockResolvedValue(undefined)
    const poller = new RulePoller({ poll })

    const listener = vi.fn()
    const unsubscribe = poller.subscribe(listener)

    await poller.pollNow()
    expect(poll).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    await poller.pollNow()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('stops notifying after unsubscribe', async () => {
    const poller = new RulePoller({ poll: async () => {} })
    const listener = vi.fn()
    const unsubscribe = poller.subscribe(listener)

    unsubscribe()
    await poller.pollNow()
    expect(listener).not.toHaveBeenCalled()
  })
})
