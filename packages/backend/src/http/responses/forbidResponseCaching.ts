import type { MiddlewareHandler } from 'hono'

export const forbidResponseCaching: MiddlewareHandler = async (context, next) => {
  await next()
  context.header('Cache-Control', 'private, no-store')
  context.header('X-Content-Type-Options', 'nosniff')
}
