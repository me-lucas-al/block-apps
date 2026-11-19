import { assembleCognitoAdminCollaborators } from '../composition/assembleCognitoAdminCollaborators'
import { createAdminUseCases } from '../composition/createAdminUseCases'
import { createApiUseCases } from '../composition/createApiUseCases'
import { createDnsResolverApp } from '../composition/createDnsResolverApp'
import { createDynamoStores } from '../composition/createDynamoStores'
import { FetchDohUpstream, readDohUpstreamUrl } from '../dns/upstream/FetchDohUpstream'
import { createAdminApp } from '../http/app/createAdminApp'
import { createApiApp } from '../http/app/createApiApp'
import { DynamoDnsSettingsStore } from '../storage/dynamodb/dns/DynamoDnsSettingsStore'
import { DynamoBlockRuleStore } from '../storage/dynamodb/rules/DynamoBlockRuleStore'
import { DynamoCooldownSettingsStore } from '../storage/dynamodb/settings/DynamoCooldownSettingsStore'
import { DynamoCooldownSettingsWriter } from '../storage/dynamodb/settings/DynamoCooldownSettingsWriter'
import type { TableContext } from '../storage/dynamodb/TableContext'
import { DynamoUserDataEraser } from '../storage/dynamodb/users/DynamoUserDataEraser'
import { createLocalRouter, type LocalRouterOptions } from './createLocalRouter'
import { seedLocalUsers } from './seedLocalUsers'

export type LocalApiOptions = LocalRouterOptions & { readonly maxRulesPerUser: number }

export function createLocalRouterFromTable(table: TableContext, options: LocalApiOptions) {
  const adminUseCases = createAdminUseCases(
    assembleCognitoAdminCollaborators(seedLocalUsers().asContext(), {
      userDataEraser: new DynamoUserDataEraser(table),
      cooldownSettingsStore: new DynamoCooldownSettingsStore(table),
      cooldownSettingsWriter: new DynamoCooldownSettingsWriter(table),
    }),
  )
  const apiUseCases = createApiUseCases(
    createDynamoStores(table),
    () => new Date(),
    options.maxRulesPerUser,
  )
  const adminApp = createAdminApp('admin', adminUseCases)
  const dnsApp = createDnsResolverApp(
    new DynamoDnsSettingsStore(table),
    new DynamoBlockRuleStore(table),
    new FetchDohUpstream(readDohUpstreamUrl(process.env)),
  )
  return createLocalRouter(createApiApp(apiUseCases), adminApp, options, dnsApp)
}
