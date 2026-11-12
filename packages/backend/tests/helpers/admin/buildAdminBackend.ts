import type { Hono } from 'hono'
import { createAdminUseCases } from '../../../src/composition/createAdminUseCases'
import type { ApiEnv } from '../../../src/http/app/ApiEnv'
import { createAdminApp } from '../../../src/http/app/createAdminApp'
import { CognitoUserReader } from '../../../src/storage/cognito/CognitoUserReader'
import { CognitoUserWriter } from '../../../src/storage/cognito/CognitoUserWriter'
import { FakeCognito } from '../cognito/FakeCognito'
import { InMemoryUserSettings } from './InMemoryUserSettings'

export type AdminBackend = {
  readonly app: Hono<ApiEnv>
  readonly cognito: FakeCognito
  readonly settings: InMemoryUserSettings
}

export function buildAdminBackend(): AdminBackend {
  const cognito = new FakeCognito()
  cognito.addUser({ id: 'admin-1', email: 'admin1@example.com', groups: new Set(['admin']) })
  cognito.addUser({ id: 'admin-2', email: 'admin2@example.com', groups: new Set(['admin']) })
  cognito.addUser({ id: 'user-1', email: 'user1@example.com', name: 'Ana', groups: new Set(['user']) })
  const settings = new InMemoryUserSettings()
  const context = cognito.asContext()
  const useCases = createAdminUseCases({
    userReader: new CognitoUserReader(context),
    userWriter: new CognitoUserWriter(context),
    userDataEraser: settings,
    cooldownSettingsStore: settings,
    cooldownSettingsWriter: settings,
  })
  return { app: createAdminApp('admin', useCases), cognito, settings }
}
