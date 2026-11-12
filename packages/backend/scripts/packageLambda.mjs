import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { zipSync } from 'fflate'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const distDirectory = `${packageRoot}dist`
const bundlePath = `${distDirectory}/index.mjs`

mkdirSync(distDirectory, { recursive: true })

await build({
  entryPoints: [`${packageRoot}src/index.ts`],
  outfile: bundlePath,
  bundle: true,
  minify: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  external: ['@aws-sdk/*'],
  legalComments: 'none',
})

const zipBytes = zipSync({ 'index.mjs': readFileSync(bundlePath) }, { mtime: new Date(2000, 0, 1) })
writeFileSync(`${distDirectory}/lambda.zip`, zipBytes)
console.log(`lambda.zip: ${zipBytes.length} bytes`)
