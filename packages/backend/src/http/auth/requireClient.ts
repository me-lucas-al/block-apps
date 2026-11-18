import { createMiddleware } from 'hono/factory'
import type { ApiEnv } from '../app/ApiEnv'

export function requireClient(allowedClientId: string) {
  return createMiddleware<ApiEnv>(async (context, next) => {
    if (context.var.user.clientId !== allowedClientId) {
      return context.json({ error: 'forbidden' }, 403)
    }
    await next()
  })
}
