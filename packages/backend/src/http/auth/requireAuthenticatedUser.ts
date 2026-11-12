import { createMiddleware } from 'hono/factory'
import type { ApiEnv } from '../app/ApiEnv'
import { readAuthenticatedUser } from './readAuthenticatedUser'

export const requireAuthenticatedUser = createMiddleware<ApiEnv>(async (context, next) => {
  const user = readAuthenticatedUser(context.env.event)
  if (!user) return context.json({ error: 'unauthenticated' }, 401)
  context.set('user', user)
  await next()
})
