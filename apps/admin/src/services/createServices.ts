import {
  type Authenticator,
  CognitoAuthenticator,
  HttpApiClient,
  HttpAdminUsersGateway,
  LocalUserSession,
  type UserSession,
} from '@block-apps/api'
import { HttpAdminUsersAdapter } from '../adapters/HttpAdminUsersAdapter'
import { HttpProfileGateway } from '../adapters/HttpProfileGateway'
import { readAdminConfig } from '../adapters/readAdminConfig'
import { WebSessionStorage } from '../adapters/WebSessionStorage'
import type { AdminUsersGateway } from '../ports/AdminUsersGateway'
import type { ProfileGateway } from '../ports/ProfileGateway'

export type Services = {
  readonly userSession: UserSession
  readonly authenticator: Authenticator
  readonly users: AdminUsersGateway
  readonly profile: ProfileGateway
}

export function createServices(): Services {
  const config = readAdminConfig()
  const storage = new WebSessionStorage()
  const userSession = new LocalUserSession(storage)
  const authenticator = new CognitoAuthenticator(
    {
      userPoolId: config.cognitoUserPoolId,
      clientId: config.cognitoClientId,
      hostedDomain: config.cognitoHostedDomain,
    },
    storage,
    userSession,
  )

  const http = new HttpApiClient({
    baseUrl: config.apiUrl,
    getToken: async () => userSession.currentIdToken(),
    onUnauthorized: async () => {
      const refreshed = await authenticator.refreshSession()
      return refreshed?.idToken ?? null
    },
  })
  const httpAdminUsers = new HttpAdminUsersGateway(http)
  const users = new HttpAdminUsersAdapter(httpAdminUsers)
  const profile = new HttpProfileGateway(userSession, httpAdminUsers, authenticator)

  return { userSession, authenticator, users, profile }
}
