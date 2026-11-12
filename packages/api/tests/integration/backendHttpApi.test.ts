import { describe, expect, it, vi } from 'vitest'
import { createApiApp } from '@block-apps/backend/src/http/app/createApiApp'
import { createApiUseCases } from '@block-apps/backend/src/composition/createApiUseCases'
import { InMemoryRuleDatabase } from '@block-apps/backend/tests/helpers/InMemoryRuleDatabase'
import { HttpApiClient } from '../../src/http/client/HttpApiClient'
import { HttpBlockRuleRepository } from '../../src/repositories/http/rules/HttpBlockRuleRepository'
import { HttpPendingRuleChangeRepository } from '../../src/repositories/http/pending-changes/HttpPendingRuleChangeRepository'
import { HttpDeviceRepository } from '../../src/repositories/http/devices/HttpDeviceRepository'

describe('backend integration with HttpApiClient and repositories', () => {
  it('manages rules and pending changes against in-memory backend app', async () => {
    const db = new InMemoryRuleDatabase()
    const now = new Date('2026-11-12T10:00:00Z')
    const useCases = createApiUseCases(
      {
        blockRuleStore: db,
        pendingChangeStore: db,
        dueChangeApplier: db,
        cooldownSettingsStore: db,
        deviceStore: db,
      },
      () => now,
    )
    const app = createApiApp(useCases)

    const fetchMock = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString()
      const request = new Request(url, init)
      const event = {
        requestContext: {
          authorizer: {
            jwt: {
              claims: { sub: 'user-integ' },
              scopes: null,
            },
          },
        },
      }
      return app.fetch(request, { event } as never)
    }

    const client = new HttpApiClient({
      baseUrl: 'https://api.internal',
      getToken: async () => 'test-token',
    })
    vi.stubGlobal('fetch', fetchMock)

    const rulesRepo = new HttpBlockRuleRepository(client)
    const pendingRepo = new HttpPendingRuleChangeRepository(client)
    const deviceRepo = new HttpDeviceRepository(client)

    const created = await rulesRepo.create({
      targetType: 'site',
      target: 'example.com',
      mode: 'always',
      windows: [],
    })
    expect(created.target).toBe('example.com')

    const listed = await rulesRepo.list()
    expect(listed).toHaveLength(1)
    expect(listed[0]?.id).toBe(created.id)

    const change = await pendingRepo.requestRemoval(created.id)
    expect(change.ruleId).toBe(created.id)

    const pending = await pendingRepo.listPendingChanges()
    expect(pending).toHaveLength(1)

    await pendingRepo.cancelPendingChange(created.id)
    const pendingAfter = await pendingRepo.listPendingChanges()
    expect(pendingAfter).toHaveLength(0)

    await deviceRepo.reportStatus({
      deviceId: 'dev-integ',
      platform: 'extension',
      incognitoAllowed: true,
      adminActive: null,
    })
  })
})
