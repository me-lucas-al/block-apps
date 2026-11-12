import { ForbiddenError } from '../../domain/errors/ForbiddenError'
import type { UserReader } from '../contracts/UserReader'
import type { DirectoryUser } from '../model/DirectoryUser'
import { isUsableAdmin } from '../model/isUsableAdmin'

export class AdminCallerGuard {
  constructor(
    private readonly userReader: UserReader,
    private readonly requireMfa: boolean = true,
  ) {}

  async requireAdminCaller(callerId: string): Promise<DirectoryUser> {
    const caller = await this.userReader.find(callerId)
    if (caller?.role !== 'admin' || !caller.enabled) throw new ForbiddenError('admin role required')
    if (!isUsableAdmin(caller)) throw new ForbiddenError('change the temporary password first')
    if (this.requireMfa && !caller.mfaActive) throw new ForbiddenError('admin TOTP MFA required')
    return caller
  }
}
