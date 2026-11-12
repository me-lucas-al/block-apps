import { Hono } from 'hono'
import { requireAuthenticatedUser } from '../auth/requireAuthenticatedUser'
import { requireGroup } from '../auth/requireGroup'
import { respondToError } from '../errors/respondToError'
import { respondToNotFound } from '../errors/respondToNotFound'
import type { ApiEnv } from './ApiEnv'

export function createAdminApp(adminGroupName: string) {
  const app = new Hono<ApiEnv>()
  app.onError(respondToError)
  app.notFound(respondToNotFound)

  app.use('/admin/*', requireAuthenticatedUser, requireGroup(adminGroupName))
  app.get('/admin/me', (context) => context.json({ userId: context.var.user.userId }))

  return app
}
