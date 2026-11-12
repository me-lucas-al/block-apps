import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
mkdirSync(`${packageRoot}dist`, { recursive: true })

await build({
  entryPoints: [`${packageRoot}src/local/startLocalServer.ts`],
  outfile: `${packageRoot}dist/local.mjs`,
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
})
console.log('dist/local.mjs built')
