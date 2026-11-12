import { ConflictError } from '../../domain/errors/ConflictError'
import type { UserReader } from '../contracts/UserReader'

export class LastAdminGuard {
  constructor(private readonly userReader: UserReader) {}

  async requireAnotherAdmin(): Promise<void> {
    if ((await this.userReader.countAdmins()) <= 1) {
      throw new ConflictError('at least one admin must remain')
    }
  }
}
