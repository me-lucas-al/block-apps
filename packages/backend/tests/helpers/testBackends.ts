import type { Hono } from 'hono'
import type { DnsSettingsStore } from '../../src/dns/contracts/DnsSettingsStore'
import type { DohUpstream } from '../../src/dns/contracts/DohUpstream'
import type { DnsTokenLookup } from '../../src/dns/contracts/DnsTokenLookup'
import type { ApiEnv } from '../../src/http/app/ApiEnv'
import { buildDynamoBackendFactory } from './backends/buildDynamoBackendFactory'
import { inMemoryBackendFactory } from './backends/inMemoryBackendFactory'
import { DYNAMODB_LOCAL_ENDPOINT } from './dynamoLocal'
import type { FakeClock } from './FakeClock'

export type TestBackend = {
  readonly app: Hono<ApiEnv>
  readonly clock: FakeClock
  readonly dnsSettingsStore: DnsSettingsStore
  readonly dnsTokenLookup: DnsTokenLookup
  createDnsResolver(upstream: DohUpstream): Hono
  applyAllDueChanges(): Promise<number>
  setCooldownHours(userId: string, cooldownHours: number): Promise<void>
  plantOrphanTokenLookup(userId: string, tokenHash: string): Promise<void>
  dispose(): Promise<void>
}

export type BackendFactory = {
  readonly name: string
  create(maxRulesPerUser?: number): Promise<TestBackend>
}

export const backendFactories: BackendFactory[] = DYNAMODB_LOCAL_ENDPOINT
  ? [inMemoryBackendFactory, buildDynamoBackendFactory(DYNAMODB_LOCAL_ENDPOINT)]
  : [inMemoryBackendFactory]
