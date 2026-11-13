import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const iosModuleRoot = join(mobileRoot, 'modules', 'app-blocker', 'ios')
const sharedTargetsRoot = join(mobileRoot, 'targets', '_shared', 'AppBlockerShared')

const sourceFolders = [
  { from: join(iosModuleRoot, 'BlockingCore', 'Sources', 'BlockingCore'), to: 'BlockingCore' },
  { from: join(iosModuleRoot, 'Shared'), to: 'Shared' },
]

rmSync(sharedTargetsRoot, { recursive: true, force: true })
mkdirSync(sharedTargetsRoot, { recursive: true })

for (const { from, to } of sourceFolders) {
  if (!existsSync(from)) throw new Error(`Missing shared Swift sources: ${from}`)
  cpSync(from, join(sharedTargetsRoot, to), { recursive: true })
}

console.log(`Synced iOS shared sources into ${sharedTargetsRoot}`)
