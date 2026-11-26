import type { BlockRule } from '@block-apps/core'
import { describe, expect, it } from 'vitest'
import { ValidationError } from '../../src/domain/errors/ValidationError'
import { TightenRuleUseCase } from '../../src/rules/use-cases/TightenRuleUseCase'
import { InMemoryRuleDatabase } from '../helpers/InMemoryRuleDatabase'

const ALWAYS_BLOCKED_RULE: BlockRule = {
  id: 'site~example.com',
  targetType: 'site',
  target: 'example.com',
  mode: 'always',
  windows: [],
}
const WORKDAY_SCHEDULE = {
  mode: 'schedule',
  windows: [{ days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' }],
} as const

describe('TightenRuleUseCase', () => {
  it('refuses a change that loosens the block and leaves the rule untouched', async () => {
    const database = new InMemoryRuleDatabase()
    await database.insert('user-1', ALWAYS_BLOCKED_RULE)
    const tightenRuleUseCase = new TightenRuleUseCase(database)

    expect(() => tightenRuleUseCase.tightenRule('user-1', ALWAYS_BLOCKED_RULE, WORKDAY_SCHEDULE)).toThrow(
      ValidationError,
    )
    expect(await database.findById('user-1', ALWAYS_BLOCKED_RULE.id)).toEqual(ALWAYS_BLOCKED_RULE)
  })

  it('stores a change that tightens the block', async () => {
    const database = new InMemoryRuleDatabase()
    const scheduledRule: BlockRule = { ...ALWAYS_BLOCKED_RULE, ...WORKDAY_SCHEDULE }
    await database.insert('user-1', scheduledRule)
    const tightenRuleUseCase = new TightenRuleUseCase(database)

    const tightened = await tightenRuleUseCase.tightenRule('user-1', scheduledRule, { mode: 'always', windows: [] })
    expect(tightened).toEqual(ALWAYS_BLOCKED_RULE)
  })
})
