import { handle } from '@hono/aws-lambda'
import { createApiUseCases } from '../composition/createApiUseCases'
import { createDynamoStores } from '../composition/createDynamoStores'
import { createTableContext } from '../composition/createTableContext'
import { readConfiguredDnsHost } from '../composition/readConfiguredDnsHost'
import { readConfiguredRuleLimit } from '../composition/readConfiguredRuleLimit'
import { createApiApp } from '../http/app/createApiApp'
import { createLazyHandler } from './createLazyHandler'

export const apiHandler = createLazyHandler(() => {
  const stores = createDynamoStores(createTableContext())
  const maxRulesPerUser = readConfiguredRuleLimit(process.env)
  const dnsHost = readConfiguredDnsHost(process.env)
  const useCases = createApiUseCases(stores, () => new Date(), maxRulesPerUser, { dnsHost })
  return handle(createApiApp(useCases))
})
