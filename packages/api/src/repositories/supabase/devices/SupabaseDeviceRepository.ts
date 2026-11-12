import type { SupabaseClient } from '@supabase/supabase-js'
import { throwIfSupabaseError } from '../../../supabase/throwIfSupabaseError'
import type { DeviceRepository, DeviceStatus } from '../../contracts/DeviceRepository'
import { toDeviceRow } from './deviceRow'

export class SupabaseDeviceRepository implements DeviceRepository {
  constructor(private readonly client: SupabaseClient) {}

  async reportStatus(status: DeviceStatus): Promise<void> {
    throwIfSupabaseError(await this.client.from('devices').upsert(toDeviceRow(status, new Date())))
  }
}
