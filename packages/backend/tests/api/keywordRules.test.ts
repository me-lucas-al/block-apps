import { describe, expect, it } from 'vitest'
import { backendFactories } from '../helpers/testBackends'
import { listRules, postRule } from '../helpers/ruleFixtures'
import { useTestBackend } from '../helpers/useTestBackend'

describe.each(backendFactories)('keyword rules ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('creates a keyword rule with normalized phrase and stable id', async () => {
    const body = { targetType: 'keyword', target: '  Pôquer   Online  ', mode: 'always' }
    const reply = await postRule(backend(), body)
    expect(reply.status).toBe(201)
    expect(reply.json).toEqual({
      id: 'keyword~poquer online',
      targetType: 'keyword',
      target: 'poquer online',
      mode: 'always',
      windows: [],
    })
  })

  it('lists keyword rules alongside other rules', async () => {
    await postRule(backend(), { targetType: 'keyword', target: 'aposta', mode: 'always' })
    const reply = await listRules(backend())
    expect(reply.status).toBe(200)
    expect(reply.json).toEqual([
      expect.objectContaining({ id: 'keyword~aposta', targetType: 'keyword', target: 'aposta' }),
    ])
  })

  it('rejects a duplicate keyword rule for the same user', async () => {
    const body = { targetType: 'keyword', target: 'cassino', mode: 'always' }
    await postRule(backend(), body)
    const reply = await postRule(backend(), body)
    expect(reply.status).toBe(409)
  })

  it.each([
    ['empty keyword', { targetType: 'keyword', target: '', mode: 'always' }],
    ['whitespace only keyword', { targetType: 'keyword', target: '   ', mode: 'always' }],
    ['keyword exceeding 100 characters', { targetType: 'keyword', target: 'a'.repeat(101), mode: 'always' }],
  ])('rejects %s', async (_label, body) => {
    const reply = await postRule(backend(), body)
    expect(reply.status).toBe(400)
  })
})
