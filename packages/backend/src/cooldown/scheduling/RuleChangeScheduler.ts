import type { PendingRuleChange } from '@block-apps/core'
import { NotFoundError } from '../../domain/errors/NotFoundError'
import type { Clock } from '../../domain/time/Clock'
import type { BlockRuleStore } from '../../rules/contracts/BlockRuleStore'
import { computeCooldownDeadline } from '../computeCooldownDeadline'
import type { CooldownSettingsStore } from '../contracts/CooldownSettingsStore'
import type { PendingChangeStore } from '../contracts/PendingChangeStore'
import type { ApplyDueChangesForUserUseCase } from '../use-cases/ApplyDueChangesForUserUseCase'
import type { ChangeDraft } from './ChangeDraft'
import { isSameChange } from './isSameChange'

export class RuleChangeScheduler {
  constructor(
    private readonly blockRuleStore: BlockRuleStore,
    private readonly pendingChangeStore: PendingChangeStore,
    private readonly cooldownSettingsStore: CooldownSettingsStore,
    private readonly applyDueChangesForUser: ApplyDueChangesForUserUseCase,
    private readonly clock: Clock,
  ) {}

  async scheduleChange(
    userId: string,
    ruleId: string,
    draft: ChangeDraft,
  ): Promise<PendingRuleChange> {
    const rule = await this.blockRuleStore.findById(userId, ruleId)
    if (!rule) throw new NotFoundError('rule not found')

    const pending = await this.pendingChangeStore.findByRuleId(userId, ruleId)
    if (pending && isSameChange(pending, draft)) return pending

    const cooldownHours = await this.cooldownSettingsStore.readCooldownHours(userId)
    const change: PendingRuleChange = {
      id: ruleId,
      ruleId,
      ...draft,
      effectiveAt: computeCooldownDeadline(this.clock(), cooldownHours),
    }
    await this.pendingChangeStore.save(userId, change)
    await this.applyChangeIfAlreadyDue(userId)
    return change
  }

  private async applyChangeIfAlreadyDue(userId: string): Promise<void> {
    await this.applyDueChangesForUser.applyDueChangesForUser(userId).catch(() => undefined)
  }
}
