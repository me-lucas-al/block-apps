import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import type { CooldownSettingsStore } from '../../src/cooldown/contracts/CooldownSettingsStore'
import type { DueChangeApplier } from '../../src/cooldown/contracts/DueChangeApplier'
import type { PendingChangeStore } from '../../src/cooldown/contracts/PendingChangeStore'
import type { DeviceStatus, DeviceStore } from '../../src/devices/contracts/DeviceStore'
import { ConflictError } from '../../src/domain/errors/ConflictError'
import type { BlockRuleStore } from '../../src/rules/contracts/BlockRuleStore'

type StoredEntry<Content> = { readonly userId: string; readonly content: Content }

export class InMemoryRuleDatabase
  implements BlockRuleStore, PendingChangeStore, DueChangeApplier, CooldownSettingsStore, DeviceStore
{
  private readonly rules = new Map<string, StoredEntry<BlockRule>>()
  private readonly changes = new Map<string, StoredEntry<PendingRuleChange>>()
  readonly devices = new Map<string, DeviceStatus & { lastSeen: string }>()
  cooldownHours = 24

  private keyOf(userId: string, id: string): string {
    return `${userId}|${id}`
  }

  async listRulesByUser(userId: string): Promise<BlockRule[]> {
    return [...this.rules.values()].filter((entry) => entry.userId === userId).map((entry) => entry.content)
  }

  async findById(userId: string, ruleId: string): Promise<BlockRule | null> {
    return this.rules.get(this.keyOf(userId, ruleId))?.content ?? null
  }

  async insert(userId: string, rule: BlockRule): Promise<void> {
    const key = this.keyOf(userId, rule.id)
    if (this.rules.has(key)) throw new ConflictError('rule already exists')
    this.rules.set(key, { userId, content: rule })
  }

  async listChangesByUser(userId: string): Promise<PendingRuleChange[]> {
    return [...this.changes.values()].filter((entry) => entry.userId === userId).map((entry) => entry.content)
  }

  async findByRuleId(userId: string, ruleId: string): Promise<PendingRuleChange | null> {
    return this.changes.get(this.keyOf(userId, ruleId))?.content ?? null
  }

  async save(userId: string, change: PendingRuleChange): Promise<void> {
    this.changes.set(this.keyOf(userId, change.ruleId), { userId, content: change })
  }

  async cancel(userId: string, ruleId: string): Promise<void> {
    this.changes.delete(this.keyOf(userId, ruleId))
  }

  async listDueByUser(userId: string, nowIso: string): Promise<PendingRuleChange[]> {
    const changes = await this.listChangesByUser(userId)
    return changes
      .filter((change) => change.effectiveAt <= nowIso)
      .sort((first, second) => first.effectiveAt.localeCompare(second.effectiveAt))
  }

  async listUserIdsWithDueChanges(nowIso: string): Promise<string[]> {
    const dueEntries = [...this.changes.values()].filter((entry) => entry.content.effectiveAt <= nowIso)
    return [...new Set(dueEntries.map((entry) => entry.userId))]
  }

  async applyDueChange(userId: string, change: PendingRuleChange): Promise<boolean> {
    const key = this.keyOf(userId, change.ruleId)
    const rule = this.rules.get(key)
    if (!rule || this.changes.get(key)?.content.effectiveAt !== change.effectiveAt) return false
    if (change.kind === 'delete') this.rules.delete(key)
    else if (change.mode) {
      this.rules.set(key, { userId, content: { ...rule.content, mode: change.mode, windows: change.windows ?? [] } })
    }
    this.changes.delete(key)
    return true
  }

  async readCooldownHours(): Promise<number> {
    return this.cooldownHours
  }

  async saveStatus(userId: string, status: DeviceStatus, reportedAt: string): Promise<void> {
    this.devices.set(this.keyOf(userId, status.deviceId), { ...status, lastSeen: reportedAt })
  }
}
