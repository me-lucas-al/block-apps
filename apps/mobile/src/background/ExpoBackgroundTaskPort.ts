import { registerTaskAsync, unregisterTaskAsync } from 'expo-background-task'
import { isTaskRegisteredAsync } from 'expo-task-manager'
import type { BackgroundTaskPort } from './BackgroundTaskPort'

export class ExpoBackgroundTaskPort implements BackgroundTaskPort {
  isRegistered(taskName: string): Promise<boolean> {
    return isTaskRegisteredAsync(taskName)
  }

  register(taskName: string, minimumIntervalMinutes: number): Promise<void> {
    return registerTaskAsync(taskName, { minimumInterval: minimumIntervalMinutes })
  }

  unregister(taskName: string): Promise<void> {
    return unregisterTaskAsync(taskName)
  }
}
