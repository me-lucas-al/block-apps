import { describe, expect, it, vi } from 'vitest'
import { HttpApiClient } from '../../src/http/client/HttpApiClient'
import { HttpDeviceRepository } from '../../src/repositories/http/devices/HttpDeviceRepository'

describe('HttpDeviceRepository', () => {
  it('reports status via PUT /devices/:id/status', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const repo = new HttpDeviceRepository(client)

    await repo.reportStatus({
      deviceId: 'dev-1',
      platform: 'android',
      incognitoAllowed: false,
      adminActive: true,
    })

    expect(fetchMock).toHaveBeenCalledWith('https://api.test/devices/dev-1/status', {
      method: 'PUT',
      headers: {
        authorization: 'Bearer tok',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        platform: 'android',
        incognitoAllowed: false,
        adminActive: true,
      }),
    })
  })
})
