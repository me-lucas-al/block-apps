export interface CooldownSettingsWriter {
  writeCooldownHours(userId: string, cooldownHours: number): Promise<void>
}
