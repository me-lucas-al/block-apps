import type { DeviceRepository } from '@block-apps/api'
import type { DeviceIdStore } from '../ports/DeviceIdStore'
import type { IncognitoPort } from '../ports/IncognitoPort'
import type { SessionGate } from '../ports/SessionGate'

export type DeviceStatusReporterDependencies = {
  readonly deviceRepository: DeviceRepository
  readonly deviceIdStore: DeviceIdStore
  readonly incognito: IncognitoPort
  readonly sessionGate: SessionGate
}

export class DeviceStatusReporter {
  constructor(private readonly dependencies: DeviceStatusReporterDependencies) {}

  async report(): Promise<void> {
    const { deviceRepository, deviceIdStore, incognito, sessionGate } =
      this.dependencies
    if (!(await sessionGate.hasSession())) return

    await deviceRepository.reportStatus({
      deviceId: await deviceIdStore.getOrCreate(),
      platform: 'extension',
      incognitoAllowed: await incognito.isAllowed(),
      adminActive: null,
    })
  }
}
