import type { Hono } from 'hono'
import type { ApiEnv } from '../../src/http/app/ApiEnv'
import { buildLambdaBindings } from './buildLambdaBindings'

export type ApiCall = {
  readonly method: string
  readonly path: string
  readonly body?: unknown
  readonly userId?: string | null
  readonly groups?: string[]
}

export type ApiReply = { readonly status: number; readonly json: unknown }

export async function callApi(app: Hono<ApiEnv>, call: ApiCall): Promise<ApiReply> {
  const userId = call.userId === undefined ? 'user-1' : call.userId
  const reply = await app.request(
    call.path,
    {
      method: call.method,
      headers: { 'content-type': 'application/json' },
      body: call.body === undefined ? undefined : JSON.stringify(call.body),
    },
    buildLambdaBindings(userId, call.groups),
  )
  const text = await reply.text()
  return { status: reply.status, json: text ? (JSON.parse(text) as unknown) : null }
}
