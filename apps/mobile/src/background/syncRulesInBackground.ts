import type { AppRulesSync } from '../sync/AppRulesSync'

export type BackgroundSyncOutcome = 'success' | 'failed'

export async function syncRulesInBackground(
  createRulesSync: () => Pick<AppRulesSync, 'sync'>,
): Promise<BackgroundSyncOutcome> {
  try {
    await createRulesSync().sync()
    return 'success'
  } catch {
    return 'failed'
  }
}
