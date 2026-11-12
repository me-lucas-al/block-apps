import { Hono } from 'hono'
import { readRuleIdParam } from '../parsing/fields/readRuleIdParam'
import type { ApiEnv } from '../app/ApiEnv'
import type { ApiUseCases } from '../app/ApiUseCases'

export function createPendingChangesRoutes(useCases: ApiUseCases) {
  const routes = new Hono<ApiEnv>()

  routes.get('/', async (context) => {
    const changes = await useCases.listPendingChanges.listPendingChanges(context.var.user.userId)
    return context.json(changes)
  })

  routes.post('/apply-due', async (context) => {
    const appliedCount = await useCases.applyDueChangesForUser.applyDueChangesForUser(
      context.var.user.userId,
    )
    return context.json({ appliedCount })
  })

  routes.delete('/:ruleId', async (context) => {
    await useCases.cancelPendingChange.cancelPendingChange(
      context.var.user.userId,
      readRuleIdParam(context),
    )
    return context.body(null, 204)
  })

  return routes
}
