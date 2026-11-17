import type { BlockerPort } from '../../../ports/blocker/BlockerPort'
import type { RulesSnapshot } from '../../../ports/blocker/RulesSnapshot'
import type { AndroidNativeModule } from './module/AndroidNativeModule'
import { toNativeRulesJson } from './rules/toNativeRulesJson'

export class AndroidBlockerAdapter implements BlockerPort {
  constructor(private readonly nativeModule: Pick<AndroidNativeModule, 'setRules'>) {}

  async applyRules({ rules }: RulesSnapshot): Promise<void> {
    this.nativeModule.setRules(toNativeRulesJson(rules))
  }

  async refreshEnforcement(): Promise<void> {
    return
  }

  async markAppOpened(): Promise<void> {
    return
  }
}
