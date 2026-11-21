import { handle } from '@hono/aws-lambda'
import { createDnsResolverApp } from '../composition/createDnsResolverApp'
import { createTableContext } from '../composition/createTableContext'
import { FetchDohUpstream, readDohUpstreamUrl } from '../dns/upstream/FetchDohUpstream'
import { DynamoDnsSettingsStore } from '../storage/dynamodb/dns/DynamoDnsSettingsStore'
import { DynamoDnsTokenLookup } from '../storage/dynamodb/dns/DynamoDnsTokenLookup'
import { DynamoBlockRuleStore } from '../storage/dynamodb/rules/DynamoBlockRuleStore'
import { createLazyHandler } from './createLazyHandler'

export const dnsHandler = createLazyHandler(() => {
  const table = createTableContext()
  const upstream = new FetchDohUpstream(readDohUpstreamUrl(process.env))
  const app = createDnsResolverApp(
    new DynamoDnsSettingsStore(table),
    new DynamoDnsTokenLookup(table),
    new DynamoBlockRuleStore(table),
    upstream,
  )
  return handle(app)
})
