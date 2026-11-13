import type { LocalUserSession, Unsubscribe } from '@block-apps/api'
import type { SessionSync } from '../../../ports/browser/SessionSync'
import { SESSION_STORAGE_KEY } from './ChromeSessionStorage'

export class ChromeSessionSync implements SessionSync {
  constructor(private readonly session: LocalUserSession) {}

  start(): Unsubscribe {
    const reloadWhenSessionChanges = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName !== 'local' || !(SESSION_STORAGE_KEY in changes)) return
      void this.session.reloadFromStorage()
    }
    chrome.storage.onChanged.addListener(reloadWhenSessionChanges)
    return () => chrome.storage.onChanged.removeListener(reloadWhenSessionChanges)
  }
}
