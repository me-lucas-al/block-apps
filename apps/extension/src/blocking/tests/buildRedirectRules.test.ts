import type { BlockRule } from '@block-apps/core'
import { describe, expect, it } from 'vitest'
import { buildRedirectRules } from '../buildRedirectRules'

const MONDAY_NOON = new Date(2026, 0, 5, 12, 0)

function rule(overrides: Partial<BlockRule>): BlockRule {
  return {
    id: 'rule',
    targetType: 'site',
    target: 'example.com',
    mode: 'always',
    windows: [],
    ...overrides,
  }
}

describe('buildRedirectRules', () => {
  it('redirects always-blocked sites to the blocked page', () => {
    const [redirect] = buildRedirectRules([rule({})], MONDAY_NOON)
    expect(redirect?.condition.requestDomains).toEqual(['example.com'])
    expect(redirect?.action.redirect.extensionPath).toBe(
      '/blocked.html?site=example.com',
    )
  })

  it('skips site targets the browser would reject', () => {
    const invalidTargets = [rule({ target: 'not a host' }), rule({ target: '' })]
    expect(buildRedirectRules(invalidTargets, MONDAY_NOON)).toEqual([])
  })

  it('cleans a full address down to its host', () => {
    const fullAddress = rule({ target: 'https://WWW.Example.com/a' })
    const [redirect] = buildRedirectRules([fullAddress], MONDAY_NOON)
    expect(redirect?.condition.requestDomains).toEqual(['example.com'])
  })

  it('skips app rules', () => {
    expect(buildRedirectRules([rule({ targetType: 'app' })], MONDAY_NOON)).toEqual([])
  })

  it('skips scheduled sites currently inside an allowed window', () => {
    const allowedNow = rule({
      mode: 'schedule',
      windows: [{ days: [1], start: '11:00', end: '13:00' }],
    })
    expect(buildRedirectRules([allowedNow], MONDAY_NOON)).toEqual([])
  })

  it('blocks scheduled sites outside every allowed window', () => {
    const blockedNow = rule({
      mode: 'schedule',
      windows: [{ days: [1], start: '18:00', end: '20:00' }],
    })
    expect(buildRedirectRules([blockedNow], MONDAY_NOON)).toHaveLength(1)
  })

  it('assigns unique incremental ids', () => {
    const rules = [rule({ target: 'a.com' }), rule({ target: 'b.com' })]
    expect(buildRedirectRules(rules, MONDAY_NOON).map((r) => r.id)).toEqual([1, 2])
  })
})
