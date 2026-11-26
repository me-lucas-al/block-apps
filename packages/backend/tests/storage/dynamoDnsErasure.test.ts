import { BatchWriteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ApiStores } from '../../src/composition/ApiStores'
import { createDynamoStores } from '../../src/composition/createDynamoStores'
import { hashDnsToken } from '../../src/dns/token/hashDnsToken'
import { DynamoUserDataEraser } from '../../src/storage/dynamodb/users/DynamoUserDataEraser'
import { buildDnsSettings } from '../helpers/dns/buildDnsSettings'
import { interceptDynamoClient } from '../helpers/dns/interceptDynamoClient'
import { createLocalTable, DYNAMODB_LOCAL_ENDPOINT, type LocalTable } from '../helpers/dynamoLocal'

const originalSettings = buildDnsSettings('token-original', 'America/Sao_Paulo')
const rotatedSettings = buildDnsSettings('token-rotated', 'America/Sao_Paulo')

describe.skipIf(!DYNAMODB_LOCAL_ENDPOINT)('DynamoDB dns erasure', () => {
  let table: LocalTable
  let stores: ApiStores

  beforeEach(async () => {
    table = await createLocalTable(DYNAMODB_LOCAL_ENDPOINT ?? '')
    stores = createDynamoStores(table.context)
  })
  afterEach(async () => {
    await table.dropTable()
  })

  async function findOwnerOf(token: string): Promise<string | null> {
    const owner = await stores.dnsTokenLookup.findValidatedDnsOwner(hashDnsToken(token))
    return owner?.userId ?? null
  }

  it('erases the dns profile of a user together with the token lookup and keeps the others', async () => {
    await stores.dnsSettingsStore.createDnsSettings('user-1', originalSettings)
    await stores.dnsSettingsStore.createDnsSettings('user-2', buildDnsSettings('token-other'))

    await new DynamoUserDataEraser(table.context).eraseAllDataOf('user-1')

    expect(await stores.dnsSettingsStore.findDnsSettings('user-1')).toBeNull()
    expect(await findOwnerOf('token-original')).toBeNull()
    expect(await findOwnerOf('token-other')).toBe('user-2')
  })

  it('validates no token when a rotation lands between the eraser read and its deletes', async () => {
    await stores.dnsSettingsStore.createDnsSettings('user-1', originalSettings)
    const racingClient = interceptDynamoClient(table.context.client, {
      afterSend: async (command) => {
        if (!(command instanceof QueryCommand)) return
        await stores.dnsSettingsStore.replaceDnsToken('user-1', originalSettings, rotatedSettings)
      },
    })

    await new DynamoUserDataEraser({ ...table.context, client: racingClient }).eraseAllDataOf('user-1')

    expect(await stores.dnsSettingsStore.findDnsSettings('user-1')).toBeNull()
    expect(await findOwnerOf('token-original')).toBeNull()
    expect(await findOwnerOf('token-rotated')).toBeNull()
  })

  it('validates no token even when the eraser fails right after the lookup keys', async () => {
    await stores.dnsSettingsStore.createDnsSettings('user-1', originalSettings)
    let batchWrites = 0
    const failingClient = interceptDynamoClient(table.context.client, {
      beforeSend: async (command) => {
        if (!(command instanceof BatchWriteCommand)) return
        batchWrites += 1
        if (batchWrites > 1) throw new Error('simulated failure after the lookup keys')
      },
    })

    await expect(
      new DynamoUserDataEraser({ ...table.context, client: failingClient }).eraseAllDataOf('user-1'),
    ).rejects.toThrow('simulated failure')

    expect(await stores.dnsSettingsStore.findDnsSettings('user-1')).not.toBeNull()
    expect(await findOwnerOf('token-original')).toBeNull()
  })
})
