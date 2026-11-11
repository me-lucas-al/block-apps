import type { AuthService, BlockRuleRepository } from '@block-apps/api'
import type { AppBlockerPort } from '../ports/AppBlockerPort'
import { toNativeRulesJson } from './toNativeRulesJson'

export type AppRulesSyncDependencies = {
  readonly repository: BlockRuleRepository
  readonly auth: Pick<AuthService, 'currentUserEmail'>
  readonly blocker: Pick<AppBlockerPort, 'setRules'>
}

export class AppRulesSync {
  constructor(private readonly dependencies: AppRulesSyncDependencies) {}

  async sync(): Promise<void> {
    const { repository, auth, blocker } = this.dependencies
    if (!(await auth.currentUserEmail())) return

    const rules = await repository.list()
    blocker.setRules(toNativeRulesJson(rules))
  }
}
