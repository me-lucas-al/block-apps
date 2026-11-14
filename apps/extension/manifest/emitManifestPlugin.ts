import type { Plugin } from 'vite'
import type { BrowserTarget } from '../src/shared/browser/browserTarget'
import { buildManifest } from './buildManifest'

export function emitManifestPlugin(target: BrowserTarget): Plugin {
  return {
    name: 'emit-extension-manifest',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: `${JSON.stringify(buildManifest(target), null, 2)}\n`,
      })
    },
  }
}
