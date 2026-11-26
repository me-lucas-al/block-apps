import { describe, expect, it, vi } from 'vitest'
import { createApiApp } from '@block-apps/backend/src/http/app/createApiApp'
import { createApiUseCases } from '@block-apps/backend/src/composition/createApiUseCases'
import { DEFAULT_MAX_RULES_PER_USER } from '@block-apps/backend/src/rules/quota/readMaxRulesPerUser'
import { buildInMemoryApiStores } from '@block-apps/backend/tests/helpers/backends/buildInMemoryApiStores'
import { buildLambdaBindings } from '@block-apps/backend/tests/helpers/buildLambdaBindings'
import { HttpApiClient } from '../../src/http/client/HttpApiClient'
import { HttpBlockRuleRepository } from '../../src/repositories/http/rules/HttpBlockRuleRepository'
import { HttpPendingRuleChangeRepository } from '../../src/repositories/http/pending-changes/HttpPendingRuleChangeRepository'
import { HttpDeviceRepository } from '../../src/repositories/http/devices/HttpDeviceRepository'

describe('backend integration with HttpApiClient and repositories', () => {
  it('manages rules and pending changes against in-memory backend app', async () => {
    const { stores } = buildInMemoryApiStores()
    const now = new Date('2026-11-12T10:00:00Z')
    const app = createApiApp(createApiUseCases(stores, () => now, DEFAULT_MAX_RULES_PER_USER))
    const bindings = buildLambdaBindings('user-integ')

    const routeFetchToBackendApp = async (
      input: string | URL | Request,
      init?: RequestInit,
    ): Promise<Response> => app.fetch(new Request(input, init), bindings)

    const client = new HttpApiClient({
      baseUrl: 'https://api.internal',
      getToken: async () => 'test-token',
    })
    vi.stubGlobal('fetch', routeFetchToBackendApp)

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
