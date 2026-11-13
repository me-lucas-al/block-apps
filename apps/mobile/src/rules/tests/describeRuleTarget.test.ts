import type { BlockRule } from '@block-apps/core'
import { describe, expect, it } from 'vitest'
import { describeRuleTarget } from '../describeRuleTarget'

const labelForApp = (packageName: string) => `App ${packageName}`

function ruleOf(targetType: BlockRule['targetType'], target: string): BlockRule {
  return { id: `${targetType}~${target}`, targetType, target, mode: 'always', windows: [] }
}

describe('describeRuleTarget', () => {
  it('uses the app label for app rules', () => {
    expect(describeRuleTarget(ruleOf('app', 'com.x'), labelForApp)).toBe('App com.x')
  })

  it('shows the phrase for keyword rules', () => {
    expect(describeRuleTarget(ruleOf('keyword', 'poquer online'), labelForApp)).toBe(
      'Busca: poquer online',
    )
  })
})
