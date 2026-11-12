import type { UserSession } from '@block-apps/api'
import type { SessionGate } from '../../../ports/data/SessionGate'

export class LocalSessionGate implements SessionGate {
  constructor(private readonly session: UserSession) {}

  async hasSession(): Promise<boolean> {
    const token = await this.session.currentIdToken()
    return token !== null
  }
}
