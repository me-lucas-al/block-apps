import type { DevicePlatform } from '@block-apps/api'
import type { AppChoicePort } from '../../ports/appchoice/AppChoicePort'
import type { BlockerPort } from '../../ports/blocker/BlockerPort'
import type { ProtectionPort } from '../../ports/protection/ProtectionPort'

export type PlatformAdapters = {
  readonly platform: Extract<DevicePlatform, 'android' | 'ios'>
  readonly blocker: BlockerPort
  readonly protection: ProtectionPort
  readonly appChoice: AppChoicePort
}
