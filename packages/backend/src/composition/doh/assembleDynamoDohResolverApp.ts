import { FetchDohUpstream } from '../../dns/upstream/FetchDohUpstream'
import { DynamoDnsSettingsStore } from '../../storage/dynamodb/dns/DynamoDnsSettingsStore'
import { DynamoDnsTokenLookup } from '../../storage/dynamodb/dns/DynamoDnsTokenLookup'
import { DynamoBlockRuleStore } from '../../storage/dynamodb/rules/DynamoBlockRuleStore'
import type { TableContext } from '../../storage/dynamodb/TableContext'
import { assembleDohResolverApp } from './assembleDohResolverApp'
import { readDohUpstreamUrl } from './readDohUpstreamUrl'

export function assembleDynamoDohResolverApp(table: TableContext, environment: NodeJS.ProcessEnv) {
  return assembleDohResolverApp(
    new DynamoDnsSettingsStore(table),
    new DynamoDnsTokenLookup(table),
    new DynamoBlockRuleStore(table),
    new FetchDohUpstream(readDohUpstreamUrl(environment)),
    () => new Date(),
  )
}
