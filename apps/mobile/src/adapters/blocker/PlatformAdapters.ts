import type { DevicePlatform } from '@block-apps/api'
import type { TargetType } from '@block-apps/core'
import type { AppChoicePort } from '../../ports/appchoice/AppChoicePort'
import type { BlockerPort } from '../../ports/blocker/BlockerPort'
import type { GroupSelectionPort } from '../../ports/groupselection/GroupSelectionPort'
import type { ProtectionPort } from '../../ports/protection/ProtectionPort'

export type PlatformAdapters = {
  readonly platform: Extract<DevicePlatform, 'android' | 'ios'>
  readonly listedTargetTypes: readonly TargetType[]
  readonly needsBackgroundRefresh: boolean
  readonly blocker: BlockerPort
  readonly protection: ProtectionPort
  readonly appChoice: AppChoicePort
  readonly groupSelection: GroupSelectionPort | null
}
