import { NotFoundError } from '../../domain/errors/NotFoundError'
import type { UserReader } from '../contracts/UserReader'
import type { DirectoryUser } from '../model/DirectoryUser'

export class ExistingUserGuard {
  constructor(private readonly userReader: UserReader) {}

  async requireExistingUser(userId: string): Promise<DirectoryUser> {
    const user = await this.userReader.find(userId)
    if (!user) throw new NotFoundError('user not found')
    return user
  }
}
