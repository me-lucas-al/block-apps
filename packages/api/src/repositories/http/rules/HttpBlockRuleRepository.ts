import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import type {
  BlockRuleRepository,
  NewBlockRule,
  RuleUpdateInput,
} from '../../contracts/BlockRuleRepository'
import type { HttpApiClient } from '../../../http/client/HttpApiClient'
import { RulePoller } from '../../../polling/RulePoller'
import type { Unsubscribe } from '../../../subscription/Unsubscribe'

export class HttpBlockRuleRepository implements BlockRuleRepository {
  private readonly poller: RulePoller

  constructor(
    private readonly http: HttpApiClient,
    pollIntervalMs?: number,
  ) {
    this.poller = new RulePoller({
      pollIntervalMs,
      poll: async () => {
        await this.list()
      },
    })
  }

  async list(): Promise<BlockRule[]> {
    return this.http.get<BlockRule[]>('/rules')
  }

  async create(newRule: NewBlockRule): Promise<BlockRule> {
    const created = await this.http.post<BlockRule>('/rules', newRule)
    void this.poller.pollNow()
    return created
  }

  async requestUpdate(ruleId: string, update: RuleUpdateInput): Promise<PendingRuleChange> {
    const change = await this.http.post<PendingRuleChange>(
      `/rules/${encodeURIComponent(ruleId)}/update-requests`,
      update,
    )
    void this.poller.pollNow()
    return change
  }

  subscribeToRuleChanges(onRuleChanged: () => void): Unsubscribe {
    return this.poller.subscribe(onRuleChanged)
  }

  pollNow(): Promise<void> {
    return this.poller.pollNow()
  }
}
