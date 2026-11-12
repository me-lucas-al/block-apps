import { Hono } from 'hono'
import type { ApiEnv } from '../app/ApiEnv'
import type { ApiUseCases } from '../app/ApiUseCases'
import { parseDeviceStatusBody } from '../parsing/bodies/parseDeviceStatusBody'
import { readJsonBody } from '../parsing/bodies/readJsonBody'

export function createDevicesRoutes(useCases: ApiUseCases) {
  const routes = new Hono<ApiEnv>()

  routes.put('/:deviceId/status', async (context) => {
    const status = parseDeviceStatusBody(
      context.req.param('deviceId'),
      await readJsonBody(context),
    )
    await useCases.reportDeviceStatus.reportDeviceStatus(context.var.user.userId, status)
    return context.body(null, 204)
  })

  return routes
}
