import { assembleCognitoAdminCollaborators } from '../../../src/composition/assembleCognitoAdminCollaborators'
import { createAdminUseCases } from '../../../src/composition/createAdminUseCases'
import { createApiUseCases } from '../../../src/composition/createApiUseCases'
import { createAdminApp } from '../../../src/http/app/createAdminApp'
import { createApiApp } from '../../../src/http/app/createApiApp'
import { buildLocalBindings } from '../../../src/local/buildLocalBindings'
import { createLocalRouter } from '../../../src/local/createLocalRouter'
import { seedLocalUsers } from '../../../src/local/seedLocalUsers'
import { DEFAULT_MAX_RULES_PER_USER } from '../../../src/rules/quota/readMaxRulesPerUser'
import { InMemoryUserSettings } from '../admin/InMemoryUserSettings'
import { InMemoryRuleDatabase } from '../InMemoryRuleDatabase'

function buildLocalTestRouter() {
  const database = new InMemoryRuleDatabase()
  const settings = new InMemoryUserSettings()
  const apiUseCases = createApiUseCases(
    {
      blockRuleStore: database,
      pendingChangeStore: database,
      dueChangeApplier: database,
      cooldownSettingsStore: database,
      deviceStore: database,
    },
    () => new Date(),
    DEFAULT_MAX_RULES_PER_USER,
  )
  const adminCollaborators = assembleCognitoAdminCollaborators(seedLocalUsers().asContext(), {
    userDataEraser: settings,
    cooldownSettingsStore: settings,
    cooldownSettingsWriter: settings,
  })
  const adminApp = createAdminApp('admin', createAdminUseCases(adminCollaborators))
  const options = { allowedOrigins: ['http://painel.local'], allowedHosts: [] }
  return createLocalRouter(createApiApp(apiUseCases), adminApp, options)
}

export function requestWithDevToken(
  path: string,
  token: string | null,
  init: RequestInit = {},
  extraHeaders: Record<string, string> = {},
  baseUrl = 'http://localhost',
) {
  const authorization = token ? `Bearer ${token}` : null
  const headers = {
    'content-type': 'application/json',
    ...(authorization && { authorization }),
    ...extraHeaders,
  }
  return buildLocalTestRouter().request(
    `${baseUrl}${path}`,
    { ...init, headers },
    buildLocalBindings(authorization),
  )
}
