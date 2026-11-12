import { describe, expect, it } from 'vitest'
import { requestWithDevToken } from '../helpers/local/requestWithDevToken'

async function preflightFrom(origin: string) {
  const headers = { origin, 'access-control-request-method': 'POST' }
  const reply = await requestWithDevToken('/rules', null, { method: 'OPTIONS' }, headers)
  return reply.headers.get('access-control-allow-origin')
}

describe('local router CORS', () => {
  it.each([
    ['http://localhost:5173', 'http://localhost:5173'],
    ['http://127.0.0.1:8080', 'http://127.0.0.1:8080'],
    ['chrome-extension://abcdefghijklmnopabcdefghijklmnop', 'chrome-extension://abcdefghijklmnopabcdefghijklmnop'],
    ['http://painel.local', 'http://painel.local'],
    ['https://evil.example.com', null],
    ['http://localhost.evil.com', null],
  ])('answers the preflight from %s with %s', async (origin, expected) => {
    expect(await preflightFrom(origin)).toBe(expected)
  })
})
