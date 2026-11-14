import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { emitManifestPlugin } from './manifest/emitManifestPlugin'
import { parseBrowserTarget } from './src/shared/browser/browserTarget'

const entry = (relativePath: string) =>
  fileURLToPath(new URL(relativePath, import.meta.url))

export default defineConfig(({ mode }) => {
  const browserTarget = parseBrowserTarget(mode === 'firefox' ? mode : undefined)
  return {
    plugins: [react(), emitManifestPlugin(browserTarget)],
    publicDir: false,
    define: {
      'import.meta.env.VITE_TARGET_BROWSER': JSON.stringify(browserTarget),
    },
    build: {
      outDir: browserTarget === 'firefox' ? 'dist-firefox' : 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: entry('./popup.html'),
          blocked: entry('./blocked.html'),
          background: entry('./src/background/index.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  }
})
