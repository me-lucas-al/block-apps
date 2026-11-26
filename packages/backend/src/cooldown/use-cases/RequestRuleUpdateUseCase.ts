import { isTighteningChange, type RuleUpdateOutcome } from '@block-apps/core'
import { NotFoundError } from '../../domain/errors/NotFoundError'
import {
  ensureValidRuleContent,
  type RuleChangeContent,
} from '../../domain/rules/ensureValidRuleContent'
import type { BlockRuleStore } from '../../rules/contracts/BlockRuleStore'
import type { TightenRuleUseCase } from '../../rules/use-cases/TightenRuleUseCase'
import type { RuleChangeScheduler } from '../scheduling/RuleChangeScheduler'

export class RequestRuleUpdateUseCase {
  constructor(
    private readonly blockRuleStore: BlockRuleStore,
    private readonly tightenRuleUseCase: TightenRuleUseCase,
    private readonly ruleChangeScheduler: RuleChangeScheduler,
  ) {}

  async requestRuleUpdate(
    userId: string,
    ruleId: string,
    content: RuleChangeContent,
  ): Promise<RuleUpdateOutcome> {
    const requested = ensureValidRuleContent(content)
    const rule = await this.blockRuleStore.findById(userId, ruleId)
    if (!rule) throw new NotFoundError('rule not found')

    if (isTighteningChange(rule, requested)) {
      const tightenedRule = await this.tightenRuleUseCase.tightenRule(userId, rule, requested)
      return { status: 'applied', rule: tightenedRule }
    }

    const change = await this.ruleChangeScheduler.scheduleChange(userId, ruleId, {
      kind: 'update',
      mode: requested.mode,
      windows: requested.windows,
    })
    return { status: 'pending', change }
  }
}
