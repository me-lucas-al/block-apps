import type { DeviceRepository } from '@block-apps/api'
import { describe, expect, it, vi } from 'vitest'
import { MobileStatusReporter } from '../MobileStatusReporter'

describe('MobileStatusReporter', () => {
  it.each(['android', 'ios'] as const)('reports %s status when token exists', async (platform) => {
    const reportStatus = vi.fn().mockResolvedValue(undefined)
    const deviceRepository: DeviceRepository = { reportStatus }

    const reporter = new MobileStatusReporter({
      deviceRepository,
      platform,
      protection: { isDeviceProtected: () => true },
      deviceIdStore: { getDeviceId: async () => `${platform}-dev-1` },
      session: { currentIdToken: async () => 'valid-jwt' },
    })

    await reporter.reportDeviceStatus()

    expect(reportStatus).toHaveBeenCalledWith({
      deviceId: `${platform}-dev-1`,
      platform,
      incognitoAllowed: null,
      adminActive: true,
    })
  })

  it('reports adminActive false when the device is not protected', async () => {
    const reportStatus = vi.fn().mockResolvedValue(undefined)
    const reporter = new MobileStatusReporter({
      deviceRepository: { reportStatus },
      platform: 'ios',
      protection: { isDeviceProtected: () => false },
      deviceIdStore: { getDeviceId: async () => 'id' },
      session: { currentIdToken: async () => 'valid-jwt' },
    })

    await reporter.reportDeviceStatus()

    expect(reportStatus).toHaveBeenCalledWith(expect.objectContaining({ adminActive: false }))
  })

  it('skips reporting when unauthenticated', async () => {
    const reportStatus = vi.fn()
    const reporter = new MobileStatusReporter({
      deviceRepository: { reportStatus },
      platform: 'android',
      protection: { isDeviceProtected: () => true },
      deviceIdStore: { getDeviceId: async () => 'id' },
      session: { currentIdToken: async () => null },
    })

    await reporter.reportDeviceStatus()
    expect(reportStatus).not.toHaveBeenCalled()
  })
})
