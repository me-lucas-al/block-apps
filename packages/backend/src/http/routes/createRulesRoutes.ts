import { Hono } from 'hono'
import type { ApiEnv } from '../app/ApiEnv'
import type { ApiUseCases } from '../app/ApiUseCases'
import { parseNewRuleBody } from '../parsing/bodies/parseNewRuleBody'
import { parseRuleContent } from '../parsing/bodies/parseRuleContent'
import { readJsonBody } from '../parsing/bodies/readJsonBody'

export function createRulesRoutes(useCases: ApiUseCases) {
  const routes = new Hono<ApiEnv>()

  routes.get('/', async (context) => {
    const rules = await useCases.listBlockRules.listBlockRules(context.var.user.userId)
    return context.json(rules)
  })

  routes.post('/', async (context) => {
    const input = parseNewRuleBody(await readJsonBody(context))
    const rule = await useCases.createBlockRule.createBlockRule(context.var.user.userId, input)
    return context.json(rule, 201)
  })

  routes.post('/:ruleId/update-requests', async (context) => {
    const content = parseRuleContent(await readJsonBody(context))
    const change = await useCases.requestRuleUpdate.requestRuleUpdate(
      context.var.user.userId,
      context.req.param('ruleId'),
      content,
    )
    return context.json(change)
  })

  routes.post('/:ruleId/removal-requests', async (context) => {
    const change = await useCases.requestRuleRemoval.requestRuleRemoval(
      context.var.user.userId,
      context.req.param('ruleId'),
    )
    return context.json(change)
  })

  return routes
}
