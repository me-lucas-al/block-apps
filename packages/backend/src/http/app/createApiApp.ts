import { Hono } from 'hono'
import { requireAuthenticatedUser } from '../auth/requireAuthenticatedUser'
import { respondToError } from '../errors/respondToError'
import { respondToNotFound } from '../errors/respondToNotFound'
import { createDnsRoutes } from '../routes/createDnsRoutes'
import { createDevicesRoutes } from '../routes/createDevicesRoutes'
import { createPendingChangesRoutes } from '../routes/createPendingChangesRoutes'
import { createRulesRoutes } from '../routes/createRulesRoutes'
import type { ApiEnv } from './ApiEnv'
import type { ApiUseCases } from './ApiUseCases'

export function createApiApp(useCases: ApiUseCases) {
  const app = new Hono<ApiEnv>()
  app.onError(respondToError)
  app.notFound(respondToNotFound)

  app.get('/health', (context) => context.json({ status: 'ok' }))

  app.use('/rules/*', requireAuthenticatedUser)
  app.use('/pending-changes/*', requireAuthenticatedUser)
  app.use('/devices/*', requireAuthenticatedUser)
  app.use('/dns/*', requireAuthenticatedUser)
  app.route('/rules', createRulesRoutes(useCases))
  app.route('/pending-changes', createPendingChangesRoutes(useCases))
  app.route('/devices', createDevicesRoutes(useCases))
  app.route('/dns', createDnsRoutes(useCases))

  return app
}
