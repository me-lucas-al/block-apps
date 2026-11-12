import { describe, expect, it } from 'vitest'
import { callApi } from '../helpers/callApi'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

const STATUS_BODY = { platform: 'extension', incognitoAllowed: false, adminActive: null }

describe.each(backendFactories)('devices ($name)', (factory) => {
  const backend = useTestBackend(factory)

  function putStatus(deviceId: string, body: unknown) {
    return callApi(backend().app, { method: 'PUT', path: `/devices/${deviceId}/status`, body })
  }

  it('stores the status of a device', async () => {
    expect((await putStatus('browser-1', STATUS_BODY)).status).toBe(204)
  })

  it('accepts a second report for the same device', async () => {
    await putStatus('browser-1', STATUS_BODY)
    const reply = await putStatus('browser-1', { ...STATUS_BODY, incognitoAllowed: true })
    expect(reply.status).toBe(204)
  })

  it.each([
    ['unknown platform', 'browser-1', { ...STATUS_BODY, platform: 'toaster' }],
    ['flag that is not a boolean', 'browser-1', { ...STATUS_BODY, adminActive: 'yes' }],
    ['device id with a hash', 'bad%23id', STATUS_BODY],
  ])('rejects %s', async (_label, deviceId, body) => {
    expect((await putStatus(deviceId, body)).status).toBe(400)
  })
})
