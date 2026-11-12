import type { DeviceRepository, UserSession } from '@block-apps/api'
import type { AppBlockerPort } from '../ports/AppBlockerPort'
import type { MobileDeviceIdStore } from './MobileDeviceIdStore'

export type MobileStatusReporterDeps = {
  readonly deviceRepository: DeviceRepository
  readonly blocker: Pick<AppBlockerPort, 'isDeviceAdminActive'>
  readonly deviceIdStore: MobileDeviceIdStore
  readonly session: Pick<UserSession, 'currentIdToken'>
}

export class MobileStatusReporter {
  constructor(private readonly deps: MobileStatusReporterDeps) {}

  async report(): Promise<void> {
    const token = await this.deps.session.currentIdToken()
    if (!token) return

    const deviceId = await this.deps.deviceIdStore.getDeviceId()
    const adminActive = this.deps.blocker.isDeviceAdminActive()

    await this.deps.deviceRepository.reportStatus({
      deviceId,
      platform: 'android',
      incognitoAllowed: null,
      adminActive,
    })
  }
}
