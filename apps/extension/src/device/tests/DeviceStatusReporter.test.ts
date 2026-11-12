import type { DeviceRepository } from '@block-apps/api'
import { describe, expect, it, vi } from 'vitest'
import { DeviceStatusReporter } from '../DeviceStatusReporter'

function createReporter(hasSession: boolean, incognitoAllowed: boolean) {
  const reportStatus = vi.fn(async () => {})
  const reporter = new DeviceStatusReporter({
    deviceRepository: { reportStatus } as DeviceRepository,
    deviceIdStore: { getOrCreate: async () => 'device-1' },
    incognito: { isAllowed: async () => incognitoAllowed, openSettings: async () => {} },
    sessionGate: { hasSession: async () => hasSession },
  })
  return { reporter, reportStatus }
}

describe('DeviceStatusReporter', () => {
  it('reports incognito status for the extension device', async () => {
    const { reporter, reportStatus } = createReporter(true, false)
    await reporter.report()
    expect(reportStatus).toHaveBeenCalledWith({
      deviceId: 'device-1',
      platform: 'extension',
      incognitoAllowed: false,
      adminActive: null,
    })
  })

  it('reports nothing when signed out', async () => {
    const { reporter, reportStatus } = createReporter(false, true)
    await reporter.report()
    expect(reportStatus).not.toHaveBeenCalled()
  })
})
