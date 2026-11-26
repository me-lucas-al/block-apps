import type { MiddlewareHandler } from 'hono'

export const forbidResponseCaching: MiddlewareHandler = async (context, next) => {
  await next()
  context.header('Cache-Control', 'no-store')
}
