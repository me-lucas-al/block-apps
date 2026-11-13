import { describe, expect, it } from 'vitest'
import { listRules, postRule, requestRemoval, SITE_RULE_BODY } from '../helpers/ruleFixtures'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

const RULE_LIMIT = 2
const FIRST_KEYWORD = { targetType: 'keyword', target: 'aposta', mode: 'always' }
const SECOND_KEYWORD = { targetType: 'keyword', target: 'cassino', mode: 'always' }

describe.each(backendFactories)('rule quota ($name)', (factory) => {
  const backend = useTestBackend(factory, RULE_LIMIT)

  it('accepts rules up to the limit', async () => {
    const first = await postRule(backend(), FIRST_KEYWORD)
    const second = await postRule(backend(), SECOND_KEYWORD)
    expect([first.status, second.status]).toEqual([201, 201])
  })

  it('rejects the rule that exceeds the limit with a typed error', async () => {
    await postRule(backend(), FIRST_KEYWORD)
    await postRule(backend(), SECOND_KEYWORD)
    const reply = await postRule(backend(), SITE_RULE_BODY)
    expect(reply.status).toBe(422)
    expect(reply.json).toEqual({
      error: 'rule limit of 2 reached',
      code: 'rule-quota-exceeded',
      maxRulesPerUser: RULE_LIMIT,
    })
  })

  it('does not store the rejected rule', async () => {
    await postRule(backend(), FIRST_KEYWORD)
    await postRule(backend(), SECOND_KEYWORD)
    await postRule(backend(), SITE_RULE_BODY)
    const reply = await listRules(backend())
    expect(reply.json).toHaveLength(RULE_LIMIT)
  })

  it('counts rules per user', async () => {
    await postRule(backend(), FIRST_KEYWORD)
    await postRule(backend(), SECOND_KEYWORD)
    const otherUserReply = await postRule(backend(), SITE_RULE_BODY, 'user-2')
    expect(otherUserReply.status).toBe(201)
  })

  it('keeps counting a rule whose removal is still pending', async () => {
    await backend().setCooldownHours('user-1', 24)
    await postRule(backend(), SITE_RULE_BODY)
    await postRule(backend(), SECOND_KEYWORD)
    await requestRemoval(backend())
    const reply = await postRule(backend(), FIRST_KEYWORD)
    expect(reply.status).toBe(422)
  })

  it('frees a slot after the removal takes effect', async () => {
    await backend().setCooldownHours('user-1', 24)
    await postRule(backend(), SITE_RULE_BODY)
    await postRule(backend(), SECOND_KEYWORD)
    await requestRemoval(backend())
    backend().clock.advanceHours(25)
    await backend().applyAllDueChanges()
    const reply = await postRule(backend(), FIRST_KEYWORD)
    expect(reply.status).toBe(201)
  })
})
