import type { InstalledApp } from '../../../../modules/app-blocker'
import type { AppChoicePort } from '../../../ports/appchoice/AppChoicePort'

export class IosAppChoiceAdapter implements AppChoicePort {
  listInstalledApps(): readonly InstalledApp[] {
    return []
  }
}
