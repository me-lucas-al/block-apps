import type { DeviceRepository, DeviceStatus } from '../../contracts/DeviceRepository'
import type { HttpApiClient } from '../../../http/client/HttpApiClient'

export class HttpDeviceRepository implements DeviceRepository {
  constructor(private readonly http: HttpApiClient) {}

  async reportStatus(status: DeviceStatus): Promise<void> {
    await this.http.put<void>(`/devices/${encodeURIComponent(status.deviceId)}/status`, {
      platform: status.platform,
      incognitoAllowed: status.incognitoAllowed,
      adminActive: status.adminActive,
    })
  }
}
