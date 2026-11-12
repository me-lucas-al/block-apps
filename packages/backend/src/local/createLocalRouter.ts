import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { ApiEnv } from '../http/app/ApiEnv'

export function createLocalRouter(apiApp: Hono<ApiEnv>, adminApp: Hono<ApiEnv>) {
  const router = new Hono<ApiEnv>()
  router.use(
    cors({
      origin: (origin) => origin,
      allowHeaders: ['authorization', 'content-type'],
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  )
  router.all('*', (context) => {
    const targetApp = new URL(context.req.url).pathname.startsWith('/admin') ? adminApp : apiApp
    return targetApp.fetch(context.req.raw, context.env)
  })
  return router
}
