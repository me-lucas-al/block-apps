import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../src/http/client/ApiError'
import { HttpApiClient } from '../../src/http/client/HttpApiClient'

describe('HttpApiClient', () => {
  it('sends authenticated get request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'test-token',
    })

    const result = await client.get<{ ok: boolean }>('/test')
    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/test', {
      method: 'GET',
      headers: { authorization: 'Bearer test-token' },
      body: undefined,
    })
  })

  it('retries request once when 401 and refresh succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ recovered: true }), { status: 200 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const onUnauthorized = vi.fn().mockResolvedValue('refreshed-token')
    const client = new HttpApiClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'stale-token',
      onUnauthorized,
    })

    const result = await client.post<{ recovered: boolean }>('/rules', { target: 'test' })
    expect(result).toEqual({ recovered: true })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('throws ApiError with status and error message on failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'rule target already exists' }), { status: 409 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => null,
    })

    await expect(client.delete('/rules/123')).rejects.toThrow(ApiError)
  })
})
