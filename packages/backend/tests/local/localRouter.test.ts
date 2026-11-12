import { describe, expect, it } from 'vitest'
import { createApiUseCases } from '../../src/composition/createApiUseCases'
import { createAdminUseCases } from '../../src/composition/createAdminUseCases'
import { createAdminApp } from '../../src/http/app/createAdminApp'
import { createApiApp } from '../../src/http/app/createApiApp'
import { buildLocalBindings } from '../../src/local/buildLocalBindings'
import { createLocalRouter } from '../../src/local/createLocalRouter'
import { buildDevToken, DEV_ADMIN_ID, DEV_USER_ID } from '../../src/local/devUsers'
import { seedLocalUsers } from '../../src/local/seedLocalUsers'
import { CognitoUserCreator } from '../../src/storage/cognito/CognitoUserCreator'
import { CognitoUserEditor } from '../../src/storage/cognito/CognitoUserEditor'
import { CognitoUserReader } from '../../src/storage/cognito/CognitoUserReader'
import { CognitoUserRemover } from '../../src/storage/cognito/CognitoUserRemover'
import { InMemoryUserSettings } from '../helpers/admin/InMemoryUserSettings'
import { InMemoryRuleDatabase } from '../helpers/InMemoryRuleDatabase'

function buildRouter() {
  const database = new InMemoryRuleDatabase()
  const settings = new InMemoryUserSettings()
  const cognito = seedLocalUsers().asContext()
  const apiUseCases = createApiUseCases(
    {
      blockRuleStore: database,
      pendingChangeStore: database,
      dueChangeApplier: database,
      cooldownSettingsStore: database,
      deviceStore: database,
    },
    () => new Date(),
  )
  const adminUseCases = createAdminUseCases({
    userReader: new CognitoUserReader(cognito),
    userCreator: new CognitoUserCreator(cognito),
    userEditor: new CognitoUserEditor(cognito),
    userRemover: new CognitoUserRemover(cognito),
    userDataEraser: settings,
    cooldownSettingsStore: settings,
    cooldownSettingsWriter: settings,
  })
  return createLocalRouter(createApiApp(apiUseCases), createAdminApp('admin', adminUseCases))
}

function send(
  path: string,
  token: string | null,
  init: RequestInit = {},
  extraHeaders: Record<string, string> = {},
) {
  const authorization = token ? `Bearer ${token}` : null
  const headers = {
    'content-type': 'application/json',
    ...(authorization && { authorization }),
    ...extraHeaders,
  }
  return buildRouter().request(path, { ...init, headers }, buildLocalBindings(authorization))
}

const userToken = buildDevToken(DEV_USER_ID, ['user'])
const adminToken = buildDevToken(DEV_ADMIN_ID, ['admin'])

describe('local router', () => {
  it('answers the health check without a token', async () => {
    expect((await send('/health', null)).status).toBe(200)
  })

  it('rejects rule routes without a token', async () => {
    expect((await send('/rules', null)).status).toBe(401)
  })

  it('lets a development user create a rule', async () => {
    const body = JSON.stringify({ targetType: 'site', target: 'exemplo.com', mode: 'always' })
    expect((await send('/rules', userToken, { method: 'POST', body })).status).toBe(201)
  })

  it('lets the development admin list users', async () => {
    const reply = await send('/admin/users', adminToken)
    expect(reply.status).toBe(200)
    expect(await reply.json()).toHaveLength(2)
  })

  it('keeps the development user out of the admin routes', async () => {
    expect((await send('/admin/users', userToken)).status).toBe(403)
  })

  it('answers the browser preflight with CORS headers', async () => {
    const preflightHeaders = { origin: 'http://localhost:5173', 'access-control-request-method': 'POST' }
    const reply = await send('/rules', null, { method: 'OPTIONS' }, preflightHeaders)
    expect(reply.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')
  })
})
