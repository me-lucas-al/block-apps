import type { BlockRuleRepository, PendingRuleChangeRepository } from '@block-apps/api'
import { IOS_DENY_APP_REMOVAL_TARGET, type BlockRule } from '@block-apps/core'
import type { StrictModeState } from './StrictModeState'

export type StrictModeDependencies = {
  readonly ruleRepository: Pick<BlockRuleRepository, 'list' | 'create'>
  readonly pendingRuleChanges: Pick<
    PendingRuleChangeRepository,
    'listPendingChanges' | 'requestRemoval' | 'cancelPendingChange'
  >
  readonly syncRulesToDevice: () => Promise<void>
  readonly isScreenTimeAuthorized: () => boolean
}

function isStrictModeRule(rule: BlockRule): boolean {
  return (
    rule.targetType === 'protection' &&
    rule.target === IOS_DENY_APP_REMOVAL_TARGET &&
    rule.mode === 'always'
  )
}

const AUTHORIZATION_REQUIRED = 'Autorize o Tempo de Uso antes de ligar o modo estrito.'

export class StrictModeController {
  constructor(private readonly dependencies: StrictModeDependencies) {}

  async readState(): Promise<StrictModeState> {
    const rule = await this.findStrictModeRule()
    if (!rule) return { status: 'off' }
    const pendingChanges = await this.dependencies.pendingRuleChanges.listPendingChanges()
    const removal = pendingChanges.find(
      (change) => change.ruleId === rule.id && change.kind === 'delete',
    )
    return removal ? { status: 'turningOff', removal } : { status: 'on' }
  }

  async turnOn(): Promise<void> {
    if (await this.findStrictModeRule()) return
    if (!this.dependencies.isScreenTimeAuthorized()) throw new Error(AUTHORIZATION_REQUIRED)
    await this.dependencies.ruleRepository.create({
      targetType: 'protection',
      target: IOS_DENY_APP_REMOVAL_TARGET,
      mode: 'always',
      windows: [],
    })
    await this.dependencies.syncRulesToDevice()
  }

  async requestTurnOff(): Promise<void> {
    const rule = await this.findStrictModeRule()
    if (!rule) return
    await this.dependencies.pendingRuleChanges.requestRemoval(rule.id)
    await this.dependencies.syncRulesToDevice()
  }

  async cancelTurnOff(): Promise<void> {
    const rule = await this.findStrictModeRule()
    if (!rule) return
    await this.dependencies.pendingRuleChanges.cancelPendingChange(rule.id)
    await this.dependencies.syncRulesToDevice()
  }

  private async findStrictModeRule(): Promise<BlockRule | undefined> {
    const rules = await this.dependencies.ruleRepository.list()
    return rules.find(isStrictModeRule)
  }
}
