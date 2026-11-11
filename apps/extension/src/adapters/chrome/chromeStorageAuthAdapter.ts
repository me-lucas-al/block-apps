export const chromeStorageAuthAdapter = {
  async getItem(key: string): Promise<string | null> {
    const stored = await chrome.storage.local.get(key)
    return (stored[key] as string | undefined) ?? null
  },

  async setItem(key: string, value: string): Promise<void> {
    await chrome.storage.local.set({ [key]: value })
  },

  async removeItem(key: string): Promise<void> {
    await chrome.storage.local.remove(key)
  },
}
