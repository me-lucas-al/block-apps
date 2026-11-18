import { Hono } from 'hono'
import type { ApiEnv } from '../app/ApiEnv'
import type { ApiUseCases } from '../app/ApiUseCases'
import { parseDnsProfileBody } from '../parsing/bodies/parseDnsProfileBody'
import { readJsonBody } from '../parsing/bodies/readJsonBody'

export function createDnsRoutes(useCases: ApiUseCases) {
  const routes = new Hono<ApiEnv>()

  routes.post('/profile', async (context) => {
    const { timeZone } = parseDnsProfileBody(await readJsonBody(context))
    const settings = await useCases.ensureDnsProfile.ensureDnsProfile(
      context.var.user.userId,
      timeZone,
    )
    return context.json(settings)
  })

  routes.post('/rotate', async (context) => {
    const settings = await useCases.rotateDnsToken.rotateDnsToken(context.var.user.userId)
    return context.json(settings)
  })

  return routes
}
