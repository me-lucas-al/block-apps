import { serve } from '@hono/node-server'
import { buildLocalBindings } from './buildLocalBindings'
import { createLocalRouterFromTable } from './createLocalRouterFromTable'
import { buildDevToken, DEV_ADMIN_ID, DEV_USER_ID } from './devUsers'
import { ensureLocalTableWhenReady } from './localTable'
import { readLocalServerConfig } from './readLocalServerConfig'

async function startLocalServer(): Promise<void> {
  const config = readLocalServerConfig(process.env)
  const table = await ensureLocalTableWhenReady(config.endpoint, config.tableName)
  const router = createLocalRouterFromTable(table, config)
  serve({
    fetch: (request) => router.fetch(request, buildLocalBindings(request.headers.get('authorization'))),
    port: config.port,
    hostname: config.hostname,
  })
  console.log(`Local API on http://${config.hostname}:${config.port} (DynamoDB at ${config.endpoint})`)
  console.log(`Admin token:  Authorization: Bearer ${buildDevToken(DEV_ADMIN_ID, ['admin'])}`)
  console.log(`User token:   Authorization: Bearer ${buildDevToken(DEV_USER_ID, ['user'])}`)
}

startLocalServer().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
