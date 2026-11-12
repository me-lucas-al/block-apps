import { describe, expect, it, vi } from 'vitest'
import { MobileStatusReporter } from '../MobileStatusReporter'
import type { DeviceRepository } from '@block-apps/api'

describe('MobileStatusReporter', () => {
  it('reports android status when token exists', async () => {
    const reportMock = vi.fn().mockResolvedValue(undefined)
    const deviceRepository: DeviceRepository = { reportStatus: reportMock }
    const blocker = { isDeviceAdminActive: () => true }
    const deviceIdStore = { getDeviceId: async () => 'android-dev-1' }
    const session = { currentIdToken: async () => 'valid-jwt' }

    const reporter = new MobileStatusReporter({
      deviceRepository,
      blocker,
      deviceIdStore,
      session,
    })

    await reporter.report()

    expect(reportMock).toHaveBeenCalledWith({
      deviceId: 'android-dev-1',
      platform: 'android',
      incognitoAllowed: null,
      adminActive: true,
    })
  })

  it('skips reporting when unauthenticated', async () => {
    const reportMock = vi.fn()
    const reporter = new MobileStatusReporter({
      deviceRepository: { reportStatus: reportMock },
      blocker: { isDeviceAdminActive: () => true },
      deviceIdStore: { getDeviceId: async () => 'id' },
      session: { currentIdToken: async () => null },
    })

    await reporter.report()
    expect(reportMock).not.toHaveBeenCalled()
  })
})
