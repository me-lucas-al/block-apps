import type { DeviceIdStore } from '../../../ports/data/DeviceIdStore'

const STORAGE_KEY = 'deviceId'

export class ChromeDeviceIdStore implements DeviceIdStore {
  async getOrCreate(): Promise<string> {
    const stored = await chrome.storage.local.get(STORAGE_KEY)
    const existing = stored[STORAGE_KEY] as string | undefined
    if (existing) return existing

    const created = crypto.randomUUID()
    await chrome.storage.local.set({ [STORAGE_KEY]: created })
    return created
  }
}
