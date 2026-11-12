import type { Hono } from 'hono'
import { assembleCognitoAdminCollaborators } from '../../../src/composition/assembleCognitoAdminCollaborators'
import { createAdminUseCases } from '../../../src/composition/createAdminUseCases'
import type { ApiEnv } from '../../../src/http/app/ApiEnv'
import { createAdminApp } from '../../../src/http/app/createAdminApp'
import { FakeCognito } from '../../../src/local/cognito/FakeCognito'
import { InMemoryUserSettings } from './InMemoryUserSettings'
import { ADMIN_ONE, ADMIN_TWO, FEDERATED_ADMIN, PENDING_USER, USER_ONE } from './userIds'

export type AdminBackend = {
  readonly app: Hono<ApiEnv>
  readonly cognito: FakeCognito
  readonly settings: InMemoryUserSettings
}

function seedUsers(cognito: FakeCognito): void {
  cognito.addUser({ sub: ADMIN_ONE, email: 'admin1@example.com', groups: new Set(['admin']) })
  cognito.addUser({ sub: ADMIN_TWO, email: 'admin2@example.com', groups: new Set(['admin']) })
  cognito.addUser({ sub: USER_ONE, email: 'user1@example.com', name: 'Ana', groups: new Set(['user']) })
  cognito.addUser({
    sub: FEDERATED_ADMIN,
    username: 'Google_104',
    email: 'google@example.com',
    status: 'EXTERNAL_PROVIDER',
    groups: new Set(['admin']),
  })
  cognito.addUser({
    sub: PENDING_USER,
    email: 'pending@example.com',
    status: 'FORCE_CHANGE_PASSWORD',
    groups: new Set(['user']),
  })
}

export function buildAdminBackend(): AdminBackend {
  const cognito = new FakeCognito()
  seedUsers(cognito)
  const settings = new InMemoryUserSettings()
  const collaborators = assembleCognitoAdminCollaborators(cognito.asContext(), {
    userDataEraser: settings,
    cooldownSettingsStore: settings,
    cooldownSettingsWriter: settings,
  })
  const app = createAdminApp('admin', createAdminUseCases(collaborators))
  return { app, cognito, settings }
}
