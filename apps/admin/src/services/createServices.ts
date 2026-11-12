import { type Authenticator, type UserSession, SupabaseAuthenticator, SupabaseUserSession } from '@block-apps/api'
import { SupabaseAdminUsersGateway } from '../adapters/SupabaseAdminUsersGateway'
import { SupabaseProfileGateway } from '../adapters/SupabaseProfileGateway'
import { createSupabaseClient } from '../adapters/createSupabaseClient'
import type { AdminUsersGateway } from '../ports/AdminUsersGateway'
import type { ProfileGateway } from '../ports/ProfileGateway'

export type Services = {
  readonly userSession: UserSession
  readonly authenticator: Authenticator
  readonly users: AdminUsersGateway
  readonly profile: ProfileGateway
}

export function createServices(): Services {
  const client = createSupabaseClient()
  return {
    userSession: new SupabaseUserSession(client),
    authenticator: new SupabaseAuthenticator(client),
    users: new SupabaseAdminUsersGateway(client),
    profile: new SupabaseProfileGateway(client),
  }
}
