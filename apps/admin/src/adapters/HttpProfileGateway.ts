import type { Authenticator, HttpAdminUsersGateway, UserSession } from '@block-apps/api'
import type { MyProfile, ProfileGateway } from '../ports/ProfileGateway'
import type { UserRole } from '../ports/userTypes'
import { decodeJwtPayload } from './decodeJwtPayload'

export class HttpProfileGateway implements ProfileGateway {
  constructor(
    private readonly userSession: UserSession,
    private readonly adminUsers: HttpAdminUsersGateway,
    private readonly authenticator: Authenticator,
  ) {}

  async loadMyProfile(): Promise<MyProfile | null> {
    const idToken = await this.userSession.currentIdToken()
    if (!idToken) return null
    const payload = decodeJwtPayload(idToken)
    if (!payload?.sub) return null
    const groups = payload['cognito:groups'] ?? []
    const role: UserRole = groups.includes('admin') ? 'admin' : 'user'
    const fallbackProfile: MyProfile = {
      id: payload.sub,
      email: payload.email ?? '',
      displayName: payload.name ?? null,
      role,
      mustChangePassword: false,
    }
    if (role !== 'admin') return fallbackProfile
    return this.enrichAdminProfile(fallbackProfile)
  }

  private async enrichAdminProfile(base: MyProfile): Promise<MyProfile> {
    try {
      const list = await this.adminUsers.listUsers()
      const found = list.find((u) => u.id === base.id || u.email.toLowerCase() === base.email.toLowerCase())
      if (!found) return base
      return {
        id: found.id,
        email: found.email,
        displayName: found.displayName ?? base.displayName,
        role: found.role,
        mustChangePassword: found.mustChangePassword,
      }
    } catch {
      return base
    }
  }

  async updateMyDisplayName(displayName: string | null): Promise<void> {
    const profile = await this.loadMyProfile()
    if (!profile) throw new Error('Not authenticated')
    await this.adminUsers.updateUser(profile.id, { displayName })
  }

  async changeEmail(_email: string): Promise<void> {
    throw new Error('Alteração de e-mail não suportada diretamente.')
  }

  async changePassword(password: string): Promise<void> {
    if (this.authenticator.respondToNewPassword) {
      await this.authenticator.respondToNewPassword(password)
      return
    }
    throw new Error('Troca de senha não disponível no momento.')
  }
}
