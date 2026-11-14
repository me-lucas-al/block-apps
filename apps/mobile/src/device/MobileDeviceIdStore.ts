import { getItemAsync, setItemAsync } from 'expo-secure-store'
import type { PlatformAdapters } from '../adapters/blocker/PlatformAdapters'
import type { DeviceIdStore } from '../ports/device/DeviceIdStore'

const DEVICE_ID_KEY = 'block_apps_device_id'

export class MobileDeviceIdStore implements DeviceIdStore {
  constructor(private readonly platform: PlatformAdapters['platform']) {}

  async getDeviceId(): Promise<string> {
    const existing = await getItemAsync(DEVICE_ID_KEY)
    if (existing) return existing

    const randomSuffix = Math.random().toString(36).slice(2, 10)
    const generated = `${this.platform}-${Date.now()}-${randomSuffix}`
    await setItemAsync(DEVICE_ID_KEY, generated)
    return generated
  }
}
