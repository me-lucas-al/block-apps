import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environmentMatchGlobs: [['src/**/tests/*.dom.test.ts', 'happy-dom']],
  },
})
