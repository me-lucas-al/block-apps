import { handle } from '@hono/aws-lambda'
import { createApiUseCases } from '../composition/createApiUseCases'
import { createDynamoStores } from '../composition/createDynamoStores'
import { createTableContext } from '../composition/createTableContext'
import { readConfiguredRuleLimit } from '../composition/readConfiguredRuleLimit'
import { createApiApp } from '../http/app/createApiApp'
import { createLazyHandler } from './createLazyHandler'

export const apiHandler = createLazyHandler(() => {
  const stores = createDynamoStores(createTableContext())
  const maxRulesPerUser = readConfiguredRuleLimit(process.env)
  const dnsHost = process.env['DNS_HOST']?.trim() || null
  const useCases = createApiUseCases(stores, () => new Date(), maxRulesPerUser, { dnsHost })
  return handle(createApiApp(useCases))
})
