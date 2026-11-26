import { Hono, type Context } from 'hono'
import { isWellFormedDnsToken } from '../../dns/token/dnsTokenFormat'
import type { ResolveDohQueryUseCase } from '../../dns/use-cases/ResolveDohQueryUseCase'
import {
  readGetDohWireQuery,
  readPostDohWireQuery,
  type ReadWireQueryResult,
} from './readDohWireQuery'

const REJECTION_STATUS_BY_READ_STATUS = {
  'bad-request': 400,
  'payload-too-large': 413,
  'unsupported-media-type': 415,
} as const

async function answerDohRequest(
  context: Context,
  resolveDohQueryUseCase: ResolveDohQueryUseCase,
  readWireQuery: () => Promise<ReadWireQueryResult> | ReadWireQueryResult,
) {
  const token = context.req.param('token') ?? ''
  if (!isWellFormedDnsToken(token)) return context.body(null, 404)
  const wireQueryRead = await readWireQuery()
  if (wireQueryRead.status !== 'ok') {
    return context.body(null, REJECTION_STATUS_BY_READ_STATUS[wireQueryRead.status])
  }
  const resolution = await resolveDohQueryUseCase.resolveDohQuery(token, wireQueryRead.wireQuery)
  if (resolution.status === 'not-found') return context.body(null, 404)
  if (resolution.status === 'invalid-query') return context.body(null, 400)
  return context.body(new Uint8Array(resolution.wireResponse), 200, {
    'content-type': 'application/dns-message',
    'cache-control': 'no-store',
  })
}

export function createDohQueryApp(resolveDohQueryUseCase: ResolveDohQueryUseCase) {
  const app = new Hono()
  app.onError((error, context) => {
    console.error(JSON.stringify({ message: 'unhandled dns error', name: error.name, detail: error.message }))
    return context.body(null, 500)
  })
  app.notFound((context) => context.body(null, 404))

  app.get('/dns-query/:token', (context) =>
    answerDohRequest(context, resolveDohQueryUseCase, () => readGetDohWireQuery(context)),
  )
  app.post('/dns-query/:token', (context) =>
    answerDohRequest(context, resolveDohQueryUseCase, () => readPostDohWireQuery(context)),
  )

  return app
}
