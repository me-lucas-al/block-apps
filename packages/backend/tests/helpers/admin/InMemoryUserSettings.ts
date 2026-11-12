import type { CooldownSettingsStore } from '../../../src/cooldown/contracts/CooldownSettingsStore'
import type { CooldownSettingsWriter } from '../../../src/users/contracts/CooldownSettingsWriter'
import type { UserDataEraser } from '../../../src/users/contracts/UserDataEraser'

export class InMemoryUserSettings
  implements CooldownSettingsStore, CooldownSettingsWriter, UserDataEraser
{
  readonly cooldownHoursByUser = new Map<string, number>()
  readonly erasedUserIds: string[] = []

  async readCooldownHours(userId: string): Promise<number> {
    return this.cooldownHoursByUser.get(userId) ?? 24
  }

  async writeCooldownHours(userId: string, cooldownHours: number): Promise<void> {
    this.cooldownHoursByUser.set(userId, cooldownHours)
  }

  async eraseAllDataOf(userId: string): Promise<void> {
    this.erasedUserIds.push(userId)
  }
}
