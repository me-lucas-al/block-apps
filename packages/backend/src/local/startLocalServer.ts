import { serve } from '@hono/node-server'
import { buildLocalBindings } from './buildLocalBindings'
import { createLocalRouterFromTable } from './createLocalRouterFromTable'
import { buildDevToken, DEV_ADMIN_ID, DEV_USER_ID } from './devUsers'
import { ensureLocalTableWhenReady } from './localTable'

const RUNNING_ON_AWS = Boolean(process.env['AWS_LAMBDA_FUNCTION_NAME'] ?? process.env['AWS_EXECUTION_ENV'])

async function startLocalServer(): Promise<void> {
  if (RUNNING_ON_AWS) throw new Error('The local server must never run on AWS')
  const endpoint = process.env['DYNAMODB_ENDPOINT']
  if (!endpoint) throw new Error('Set DYNAMODB_ENDPOINT, for example http://127.0.0.1:8000')
  const tableName = process.env['LOCAL_TABLE_NAME'] ?? 'block-apps-local-data'
  const table = await ensureLocalTableWhenReady(endpoint, tableName)
  const router = createLocalRouterFromTable(table)
  const port = Number(process.env['PORT'] ?? 3000)
  const hostname = process.env['HOST'] ?? '127.0.0.1'
  serve({
    fetch: (request) => router.fetch(request, buildLocalBindings(request.headers.get('authorization'))),
    port,
    hostname,
  })
  console.log(`Local API on http://${hostname}:${port} (DynamoDB at ${endpoint})`)
  console.log(`Admin token:  Authorization: Bearer ${buildDevToken(DEV_ADMIN_ID, ['admin'])}`)
  console.log(`User token:   Authorization: Bearer ${buildDevToken(DEV_USER_ID, ['user'])}`)
}

startLocalServer().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
