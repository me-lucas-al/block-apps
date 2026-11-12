import { assembleCognitoAdminCollaborators } from '../composition/assembleCognitoAdminCollaborators'
import { createAdminUseCases } from '../composition/createAdminUseCases'
import { createApiUseCases } from '../composition/createApiUseCases'
import { createDynamoStores } from '../composition/createDynamoStores'
import { createAdminApp } from '../http/app/createAdminApp'
import { createApiApp } from '../http/app/createApiApp'
import { DynamoCooldownSettingsStore } from '../storage/dynamodb/settings/DynamoCooldownSettingsStore'
import { DynamoCooldownSettingsWriter } from '../storage/dynamodb/settings/DynamoCooldownSettingsWriter'
import type { TableContext } from '../storage/dynamodb/TableContext'
import { DynamoUserDataEraser } from '../storage/dynamodb/users/DynamoUserDataEraser'
import { createLocalRouter, type LocalRouterOptions } from './createLocalRouter'
import { seedLocalUsers } from './seedLocalUsers'

export function createLocalRouterFromTable(table: TableContext, options: LocalRouterOptions) {
  const adminUseCases = createAdminUseCases(
    assembleCognitoAdminCollaborators(seedLocalUsers().asContext(), {
      userDataEraser: new DynamoUserDataEraser(table),
      cooldownSettingsStore: new DynamoCooldownSettingsStore(table),
      cooldownSettingsWriter: new DynamoCooldownSettingsWriter(table),
    }),
  )
  const apiUseCases = createApiUseCases(createDynamoStores(table), () => new Date())
  const adminApp = createAdminApp('admin', adminUseCases)
  return createLocalRouter(createApiApp(apiUseCases), adminApp, options)
}
