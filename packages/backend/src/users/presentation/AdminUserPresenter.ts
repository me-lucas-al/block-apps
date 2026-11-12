import type { CooldownSettingsStore } from '../../cooldown/contracts/CooldownSettingsStore'
import type { AdminUser } from '../model/AdminUser'
import type { DirectoryUser } from '../model/DirectoryUser'

export class AdminUserPresenter {
  constructor(private readonly cooldownSettingsStore: CooldownSettingsStore) {}

  async presentUser(user: DirectoryUser): Promise<AdminUser> {
    const cooldownHours = await this.cooldownSettingsStore.readCooldownHours(user.id)
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      cooldownHours,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    }
  }

  presentUsers(users: readonly DirectoryUser[]): Promise<AdminUser[]> {
    return Promise.all(users.map((user) => this.presentUser(user)))
  }
}
