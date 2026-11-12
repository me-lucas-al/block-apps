import { getItemAsync, setItemAsync } from 'expo-secure-store'
import type { DeviceIdStore } from '../ports/DeviceIdStore'

const DEVICE_ID_KEY = 'block_apps_device_id'

export class MobileDeviceIdStore implements DeviceIdStore {
  async getDeviceId(): Promise<string> {
    const existing = await getItemAsync(DEVICE_ID_KEY)
    if (existing) return existing

    const generated = `android-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    await setItemAsync(DEVICE_ID_KEY, generated)
    return generated
  }
}
