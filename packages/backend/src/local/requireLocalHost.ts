import { createMiddleware } from 'hono/factory'
import type { ApiEnv } from '../http/app/ApiEnv'

export function requireLocalHost(acceptedHostnames: ReadonlySet<string>) {
  return createMiddleware<ApiEnv>(async (context, next) => {
    if (!acceptedHostnames.has(new URL(context.req.url).hostname)) {
      return context.json({ error: 'host not allowed' }, 403)
    }
    await next()
  })
}
