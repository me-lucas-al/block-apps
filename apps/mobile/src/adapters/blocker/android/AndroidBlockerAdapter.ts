import type { BlockRule } from '@block-apps/core'
import type { BlockerPort } from '../../../ports/blocker/BlockerPort'
import type { AndroidNativeModule } from './AndroidNativeModule'
import { toNativeRulesJson } from './toNativeRulesJson'

export class AndroidBlockerAdapter implements BlockerPort {
  constructor(private readonly nativeModule: Pick<AndroidNativeModule, 'setRules'>) {}

  applyRules(rules: readonly BlockRule[]): void {
    this.nativeModule.setRules(toNativeRulesJson(rules))
  }
}
