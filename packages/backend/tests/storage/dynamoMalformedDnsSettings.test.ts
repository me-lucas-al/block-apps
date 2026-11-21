import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiStores } from '../../src/composition/ApiStores'
import { createApiUseCases } from '../../src/composition/createApiUseCases'
import { createDynamoStores } from '../../src/composition/createDynamoStores'
import { MalformedDnsSettingsError } from '../../src/dns/errors/MalformedDnsSettingsError'
import { createApiApp } from '../../src/http/app/createApiApp'
import { dnsSettingsKey } from '../../src/storage/dynamodb/dns/items/dnsKeys'
import { callApi } from '../helpers/callApi'
import { createLocalTable, DYNAMODB_LOCAL_ENDPOINT, type LocalTable } from '../helpers/dynamoLocal'

const SECRET_TOKEN = 'secret-token-that-must-not-be-logged'

describe.skipIf(!DYNAMODB_LOCAL_ENDPOINT)('DynamoDB malformed dns settings', () => {
  let table: LocalTable
  let stores: ApiStores

  beforeEach(async () => {
    table = await createLocalTable(DYNAMODB_LOCAL_ENDPOINT ?? '')
    stores = createDynamoStores(table.context)
    await table.context.client.send(
      new PutCommand({
        TableName: table.context.tableName,
        Item: { ...dnsSettingsKey('user-1'), token: SECRET_TOKEN, timeZone: 'UTC' },
      }),
    )
  })
  afterEach(async () => {
    vi.restoreAllMocks()
    await table.dropTable()
  })

  it('fails the read with a dedicated error', async () => {
    await expect(stores.dnsSettingsStore.findDnsSettings('user-1')).rejects.toBeInstanceOf(
      MalformedDnsSettingsError,
    )
  })

  it('answers 500 and logs the failure without the token instead of looping on 409', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = createApiApp(createApiUseCases(stores, () => new Date(), 10))

    const reply = await callApi(app, {
      method: 'POST',
      path: '/dns/profile',
      body: { timeZone: 'UTC' },
    })

    expect(reply.status).toBe(500)
    const logLine = String(logged.mock.calls[0]?.[0])
    expect(logLine).toContain('MalformedDnsSettingsError')
    expect(logLine).not.toContain(SECRET_TOKEN)
  })
})
