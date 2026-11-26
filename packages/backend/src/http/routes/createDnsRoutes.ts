import { Hono } from 'hono'
import type { ApiEnv } from '../app/ApiEnv'
import type { ApiUseCases } from '../app/ApiUseCases'
import { parseDnsProfileBody } from '../parsing/bodies/parseDnsProfileBody'
import { readJsonBody } from '../parsing/bodies/readJsonBody'
import { forbidResponseCaching } from '../responses/forbidResponseCaching'

export function createDnsRoutes(useCases: ApiUseCases) {
  const routes = new Hono<ApiEnv>()

  routes.use('*', forbidResponseCaching)

  routes.post('/profile', async (context) => {
    const { timeZone } = parseDnsProfileBody(await readJsonBody(context))
    const dnsSettings = await useCases.ensureDnsProfile.ensureDnsProfile(
      context.var.user.userId,
      timeZone,
    )
    return context.json(dnsSettings)
  })

  routes.post('/rotate', async (context) => {
    const dnsSettings = await useCases.rotateDnsToken.rotateDnsToken(context.var.user.userId)
    return context.json(dnsSettings)
  })

  return routes
}
