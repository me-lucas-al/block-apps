import { AdminError } from '../AdminError.ts'
import type { AdminUser } from '../model/adminUser.ts'
import type { UserDirectory } from '../model/UserDirectory.ts'

export class ExistingUserGuard {
  constructor(private readonly userDirectory: UserDirectory) {}

  async requireExistingUser(userId: string): Promise<AdminUser> {
    const user = await this.userDirectory.find(userId)
    if (!user) throw new AdminError('not_found', 'user not found')
    return user
  }
}
