import type { AuthService, BlockRuleRepository } from '@block-apps/api'
import type { BlockRule } from '@block-apps/core'
import type { AppBlockerPort } from '../ports/AppBlockerPort'
import { toNativeRulesJson } from './toNativeRulesJson'

export type AppRulesSyncDependencies = {
  readonly repository: Pick<BlockRuleRepository, 'list' | 'applyDueChanges'>
  readonly auth: Pick<AuthService, 'currentUserEmail'>
  readonly blocker: Pick<AppBlockerPort, 'setRules'>
}

export class AppRulesSync {
  constructor(private readonly dependencies: AppRulesSyncDependencies) {}

  push(rules: readonly BlockRule[]): void {
    this.dependencies.blocker.setRules(toNativeRulesJson(rules))
  }

  async sync(): Promise<void> {
    const { repository, auth } = this.dependencies
    if (!(await auth.currentUserEmail())) return

    await repository.applyDueChanges()
    this.push(await repository.list())
  }
}
