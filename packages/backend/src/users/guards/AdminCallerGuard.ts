import { ForbiddenError } from '../../domain/errors/ForbiddenError'
import type { UserReader } from '../contracts/UserReader'
import type { DirectoryUser } from '../model/DirectoryUser'

export class AdminCallerGuard {
  constructor(private readonly userReader: UserReader) {}

  async requireAdminCaller(callerId: string): Promise<DirectoryUser> {
    const caller = await this.userReader.find(callerId)
    if (caller?.role !== 'admin' || !caller.enabled) throw new ForbiddenError('admin role required')
    if (caller.mustChangePassword) throw new ForbiddenError('change the temporary password first')
    return caller
  }
}
