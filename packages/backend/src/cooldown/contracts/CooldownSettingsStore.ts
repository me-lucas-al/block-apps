export interface CooldownSettingsStore {
  readCooldownHours(userId: string): Promise<number>
}
