import type { DeviceRepository, UserSession } from '@block-apps/api'
import type { PlatformAdapters } from '../adapters/blocker/PlatformAdapters'
import type { DeviceIdStore } from '../ports/device/DeviceIdStore'
import type { ProtectionPort } from '../ports/protection/ProtectionPort'

export type MobileStatusReporterDeps = {
  readonly deviceRepository: DeviceRepository
  readonly platform: PlatformAdapters['platform']
  readonly protection: Pick<ProtectionPort, 'isDeviceProtected'>
  readonly deviceIdStore: DeviceIdStore
  readonly session: Pick<UserSession, 'currentIdToken'>
}

export class MobileStatusReporter {
  constructor(private readonly deps: MobileStatusReporterDeps) {}

  async reportDeviceStatus(): Promise<void> {
    const token = await this.deps.session.currentIdToken()
    if (!token) return

    const deviceId = await this.deps.deviceIdStore.getDeviceId()

    await this.deps.deviceRepository.reportStatus({
      deviceId,
      platform: this.deps.platform,
      incognitoAllowed: null,
      adminActive: this.deps.protection.isDeviceProtected(),
    })
  }
}
