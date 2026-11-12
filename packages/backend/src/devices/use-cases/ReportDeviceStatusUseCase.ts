import type { Clock } from '../../domain/time/Clock'
import type { DeviceStatus, DeviceStore } from '../contracts/DeviceStore'

export class ReportDeviceStatusUseCase {
  constructor(
    private readonly deviceStore: DeviceStore,
    private readonly clock: Clock,
  ) {}

  reportDeviceStatus(userId: string, status: DeviceStatus): Promise<void> {
    return this.deviceStore.saveStatus(userId, status, this.clock().toISOString())
  }
}
