import { build } from 'esbuild'
import { describe, expect, it } from 'vitest'

describe('Lambda bundle', () => {
  it('never contains the local server, the fake Cognito or the development token', async () => {
    const outcome = await build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      write: false,
      metafile: true,
      platform: 'node',
      format: 'esm',
      external: ['@aws-sdk/*'],
      logLevel: 'silent',
    })
    const inputs = Object.keys(outcome.metafile.inputs)
    const bundledText = outcome.outputFiles.map((file) => file.text).join('')
    expect(inputs.some((input) => input.startsWith('src/local/'))).toBe(false)
    expect(inputs.some((input) => input.startsWith('tests/'))).toBe(false)
    expect(bundledText).not.toContain('FakeCognito')
    expect(bundledText).not.toContain('Bearer dev')
  })
})
