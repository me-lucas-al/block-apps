import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { ApiEnv } from '../http/app/ApiEnv'
import { isAllowedLocalOrigin } from './isAllowedLocalOrigin'
import { requireLocalHost } from './requireLocalHost'

export type LocalRouterOptions = {
  readonly allowedOrigins: readonly string[]
  readonly allowedHosts: readonly string[]
}

const LOOPBACK_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]']

export function createLocalRouter(
  apiApp: Hono<ApiEnv>,
  adminApp: Hono<ApiEnv>,
  options: LocalRouterOptions,
) {
  const acceptedHosts = new Set([...LOOPBACK_HOSTNAMES, ...options.allowedHosts])
  const router = new Hono<ApiEnv>()
  router.use(requireLocalHost(acceptedHosts))
  router.use(
    cors({
      origin: (origin) => (isAllowedLocalOrigin(origin, options.allowedOrigins) ? origin : null),
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
