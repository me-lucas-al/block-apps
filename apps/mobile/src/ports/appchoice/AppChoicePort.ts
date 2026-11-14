import type { InstalledApp } from '../../../modules/app-blocker'

export interface AppChoicePort {
  listInstalledApps(): readonly InstalledApp[]
}
