import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../../src/http/app/ApiEnv'
import { requireAllowedClient } from '../../src/http/auth/requireAllowedClient'

function buildAppSignedInThroughClient(clientId: string | null) {
  const app = new Hono<ApiEnv>()
  app.use(
    createMiddleware<ApiEnv>(async (context, next) => {
      context.set('user', { userId: 'user-1', groups: [], clientId })
      await next()
    }),
  )
  app.use(requireAllowedClient('admin-client'))
  app.get('/', (context) => context.json({ reached: true }))
  return app
}

describe('requireAllowedClient', () => {
  it('lets a token from the allowed client through', async () => {
    const reply = await buildAppSignedInThroughClient('admin-client').request('/')
    expect(reply.status).toBe(200)
  })

  it('rejects a token from another client', async () => {
    const reply = await buildAppSignedInThroughClient('device-client').request('/')
    expect(reply.status).toBe(403)
    expect(await reply.json()).toEqual({ error: 'forbidden' })
  })

  it('rejects a token without a client', async () => {
    const reply = await buildAppSignedInThroughClient(null).request('/')
    expect(reply.status).toBe(403)
  })
})
