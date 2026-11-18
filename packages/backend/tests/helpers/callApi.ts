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

export type RawApiReply = {
  readonly status: number
  readonly headers: Headers
  readonly text: string
}

export async function callRawApi(app: Hono<ApiEnv>, call: ApiCall): Promise<RawApiReply> {
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
  return { status: reply.status, headers: reply.headers, text: await reply.text() }
}

export async function callApi(app: Hono<ApiEnv>, call: ApiCall): Promise<ApiReply> {
  const reply = await callRawApi(app, call)
  return { status: reply.status, json: reply.text ? (JSON.parse(reply.text) as unknown) : null }
}
