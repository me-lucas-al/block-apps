import type { SessionStorage, SessionTokens } from '@block-apps/api'
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store'
import { parseLegacySession } from './parseLegacySession'
import { SerialTaskQueue } from './SerialTaskQueue'
import { LEGACY_STORAGE_KEY, TOKEN_FIELDS, TOKEN_KEYS } from './secureSessionKeys'
import { readStoredFields, toCompleteSession, type StoredFields } from './storedFields'

export class SecureSessionStorage implements SessionStorage {
  private readonly queue = new SerialTaskQueue()

  load(): Promise<SessionTokens | null> {
    return this.queue.run(() => this.loadOrMigrate())
  }

  save(tokens: SessionTokens): Promise<void> {
    return this.queue.run(() => this.writeTokens(tokens))
  }

  clear(): Promise<void> {
    return this.queue.run(() => this.deleteAllSessionKeys())
  }

  private async loadOrMigrate(): Promise<SessionTokens | null> {
    const currentSession = toCompleteSession(await readStoredFields())
    return currentSession ?? (await this.migrateLegacySession())
  }

  private async writeTokens(tokens: SessionTokens): Promise<void> {
    const previousFields = await readStoredFields()
    try {
      for (const field of TOKEN_FIELDS) await setItemAsync(TOKEN_KEYS[field], tokens[field])
    } catch (writeFailure) {
      await this.restoreFields(previousFields)
      throw writeFailure
    }
  }

  private async restoreFields(previousFields: StoredFields): Promise<void> {
    await Promise.allSettled(
      TOKEN_FIELDS.map((field) => {
        const previousValue = previousFields[field]
        return previousValue
          ? setItemAsync(TOKEN_KEYS[field], previousValue)
          : deleteItemAsync(TOKEN_KEYS[field])
      }),
    )
  }

  private async migrateLegacySession(): Promise<SessionTokens | null> {
    const rawLegacySession = await getItemAsync(LEGACY_STORAGE_KEY)
    if (!rawLegacySession) return null
    const legacySession = parseLegacySession(rawLegacySession)
    if (!legacySession) return null
    if (await this.copyAndConfirm(legacySession)) await deleteItemAsync(LEGACY_STORAGE_KEY)
    return legacySession
  }

  private async copyAndConfirm(session: SessionTokens): Promise<boolean> {
    try {
      await this.writeTokens(session)
      const storedSession = toCompleteSession(await readStoredFields())
      return storedSession !== null && TOKEN_FIELDS.every((field) => storedSession[field] === session[field])
    } catch {
      return false
    }
  }

  private async deleteAllSessionKeys(): Promise<void> {
    const keys = [...TOKEN_FIELDS.map((field) => TOKEN_KEYS[field]), LEGACY_STORAGE_KEY]
    await Promise.all(keys.map((key) => deleteItemAsync(key)))
  }
}
