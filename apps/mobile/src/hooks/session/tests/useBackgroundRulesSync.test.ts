import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBackgroundRulesSync } from '../useBackgroundRulesSync'

const scheduleRulesSync = vi.fn()

vi.mock('react', () => ({
  useEffect: (runEffect: () => void) => runEffect(),
}))

vi.mock('../../../services/ServicesContext', () => ({
  useServices: () => ({ rulesSyncScheduler: { scheduleRulesSync } }),
}))

describe('useBackgroundRulesSync', () => {
  beforeEach(() => {
    scheduleRulesSync.mockReset().mockResolvedValue(undefined)
  })

  it('schedules the background sync when there is a signed in session', () => {
    useBackgroundRulesSync('user@test.com', false)

    expect(scheduleRulesSync).toHaveBeenCalledOnce()
  })

  it('does nothing while the session is still loading', () => {
    useBackgroundRulesSync('user@test.com', true)

    expect(scheduleRulesSync).not.toHaveBeenCalled()
  })

  it('does not schedule when there is no session', () => {
    useBackgroundRulesSync(null, false)

    expect(scheduleRulesSync).not.toHaveBeenCalled()
  })

  it('swallows scheduling failures', async () => {
    scheduleRulesSync.mockRejectedValue(new Error('restricted'))

    expect(() => useBackgroundRulesSync('user@test.com', false)).not.toThrow()
    await Promise.resolve()
  })
})
