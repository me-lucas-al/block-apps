export interface BackgroundTaskPort {
  isRegistered(taskName: string): Promise<boolean>
  register(taskName: string, minimumIntervalMinutes: number): Promise<void>
  unregister(taskName: string): Promise<void>
}
