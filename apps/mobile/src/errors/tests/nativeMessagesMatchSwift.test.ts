import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { NATIVE_FAILURE_MESSAGES } from '../describeAppFailure'

const EXCEPTIONS_FOLDER = join(__dirname, '../../../modules/app-blocker/ios/Exceptions')

function listSwiftFiles(folder: string): string[] {
  return readdirSync(folder).flatMap((entry) => {
    const entryPath = join(folder, entry)
    if (statSync(entryPath).isDirectory()) return listSwiftFiles(entryPath)
    return entry.endsWith('Exception.swift') ? [entryPath] : []
  })
}

function readExceptionTexts(swiftSource: string): { code: string; reason: string } | null {
  const code = /var code: String \{ "([A-Z_]+)" \}/.exec(swiftSource)?.[1]
  const reason = /var reason: String \{\s*"([^"]+)"\s*\}/.exec(swiftSource)?.[1]
  return code && reason ? { code, reason } : null
}

describe('native failure messages', () => {
  const swiftTexts = listSwiftFiles(EXCEPTIONS_FOLDER).map((file) =>
    readExceptionTexts(readFileSync(file, 'utf8')),
  )

  it('reads a code and a reason from every Swift exception', () => {
    expect(swiftTexts.length).toBeGreaterThan(0)
    expect(swiftTexts.every((texts) => texts !== null)).toBe(true)
  })

  it('keeps the app messages identical to the Swift reasons', () => {
    for (const texts of swiftTexts) {
      expect(NATIVE_FAILURE_MESSAGES[texts?.code ?? '']).toBe(texts?.reason)
    }
  })

  it('has a Swift exception for every code the app knows', () => {
    const swiftCodes = swiftTexts.map((texts) => texts?.code)
    expect(Object.keys(NATIVE_FAILURE_MESSAGES).sort()).toEqual([...swiftCodes].sort())
  })
})
