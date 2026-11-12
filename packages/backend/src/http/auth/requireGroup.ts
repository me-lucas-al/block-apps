import { createMiddleware } from 'hono/factory'
import type { ApiEnv } from '../app/ApiEnv'

export function requireGroup(requiredGroup: string) {
  return createMiddleware<ApiEnv>(async (context, next) => {
    if (!context.var.user.groups.includes(requiredGroup)) {
      return context.json({ error: 'forbidden' }, 403)
    }
    await next()
  })
}
