import { describe, expect, it } from 'vitest'
import { normalizeRuleTarget } from '../../src/domain/rules/normalizeRuleTarget'
import { ValidationError } from '../../src/domain/errors/ValidationError'

describe('normalizeRuleTarget', () => {
  it('normalizes site domain to lowercase without protocol', () => {
    expect(normalizeRuleTarget('site', 'https://WWW.Example.COM/path')).toBe('example.com')
  })

  it('throws ValidationError for invalid site domain', () => {
    expect(() => normalizeRuleTarget('site', 'not a valid domain')).toThrow(ValidationError)
  })

  it('normalizes keyword by trimming, lowercasing and stripping accents', () => {
    expect(normalizeRuleTarget('keyword', '  Pôquer   Online  ')).toBe('poquer online')
  })

  it('throws ValidationError for empty or invalid keyword', () => {
    expect(() => normalizeRuleTarget('keyword', '   ')).toThrow(ValidationError)
    expect(() => normalizeRuleTarget('keyword', 'a'.repeat(101))).toThrow(ValidationError)
    expect(() => normalizeRuleTarget('keyword', '!@#$%^&*()')).toThrow(ValidationError)
  })

  it('preserves valid app identifier', () => {
    expect(normalizeRuleTarget('app', 'com.example.app')).toBe('com.example.app')
  })

  it('throws ValidationError for app identifier with invalid characters', () => {
    expect(() => normalizeRuleTarget('app', 'com/invalid/app')).toThrow(ValidationError)
  })
})
