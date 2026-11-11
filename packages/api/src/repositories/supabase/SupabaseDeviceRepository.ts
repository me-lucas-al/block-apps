import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  DeviceRepository,
  DeviceStatus,
} from '../contracts/DeviceRepository'
import { assertNoError } from './unwrap'

export class SupabaseDeviceRepository implements DeviceRepository {
  constructor(private readonly client: SupabaseClient) {}

  async reportStatus(status: DeviceStatus): Promise<void> {
    assertNoError(
      await this.client.from('devices').upsert({
        id: status.deviceId,
        platform: status.platform,
        incognito_allowed: status.incognitoAllowed,
        admin_active: status.adminActive,
        last_seen: new Date().toISOString(),
      }),
    )
  }
}
