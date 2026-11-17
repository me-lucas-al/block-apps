import type { InstalledApp } from '../../../../modules/app-blocker'
import type { AppChoicePort } from '../../../ports/appchoice/AppChoicePort'
import type { AndroidNativeModule } from './module/AndroidNativeModule'

export class AndroidAppChoiceAdapter implements AppChoicePort {
  constructor(private readonly nativeModule: Pick<AndroidNativeModule, 'listLaunchableApps'>) {}

  listInstalledApps(): readonly InstalledApp[] {
    return this.nativeModule.listLaunchableApps()
  }
}
