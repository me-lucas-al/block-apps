import { Hono } from 'hono'
import { requireAuthenticatedUser } from '../auth/requireAuthenticatedUser'
import { requireClient } from '../auth/requireClient'
import { requireGroup } from '../auth/requireGroup'
import { respondToError } from '../errors/respondToError'
import { respondToNotFound } from '../errors/respondToNotFound'
import { createUsersRoutes } from '../routes/createUsersRoutes'
import type { AdminUseCases } from './AdminUseCases'
import type { ApiEnv } from './ApiEnv'

export function createAdminApp(
  adminGroupName: string,
  adminClientId: string,
  useCases: AdminUseCases,
) {
  const app = new Hono<ApiEnv>()
  app.onError(respondToError)
  app.notFound(respondToNotFound)

  app.use(
    '/admin/*',
    requireAuthenticatedUser,
    requireClient(adminClientId),
    requireGroup(adminGroupName),
  )
  app.get('/admin/me', (context) => context.json({ userId: context.var.user.userId }))
  app.route('/admin/users', createUsersRoutes(useCases))

  return app
}
