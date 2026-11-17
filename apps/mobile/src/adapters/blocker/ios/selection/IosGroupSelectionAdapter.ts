import type {
  ChooseAppsOutcome,
  GroupSelectionPort,
  GroupStates,
} from '../../../../ports/groupselection/GroupSelectionPort'
import { SignInRequiredError } from '../../../../errors/SignInRequiredError'
import type { IosNativeModule } from '../module/IosNativeModule'
import { parseChooseAppsOutcome } from './parseChooseAppsOutcome'

export type CurrentOwnerId = () => Promise<string | null>

export class IosGroupSelectionAdapter implements GroupSelectionPort {
  constructor(
    private readonly nativeModule: IosNativeModule,
    private readonly currentOwnerId: CurrentOwnerId,
  ) {}

  loadGroupStates(ruleIds: readonly string[]): Promise<GroupStates> {
    return this.nativeModule.getGroupStates([...ruleIds])
  }

  async chooseApps(ruleId: string): Promise<ChooseAppsOutcome> {
    const ownerId = await this.currentOwnerId()
    if (!ownerId) return 'notOwner'
    return parseChooseAppsOutcome(await this.nativeModule.presentAppSelectionPicker(ruleId, ownerId))
  }

  async holdPendingRemoval(ruleId: string, effectiveAtIso: string): Promise<void> {
    const ownerId = await this.currentOwnerId()
    if (!ownerId) throw new SignInRequiredError()
    this.nativeModule.holdPendingSelection(ruleId, effectiveAtIso, ownerId)
  }

  discardPendingRemoval(ruleId: string): void {
    this.nativeModule.discardPendingSelection(ruleId)
  }
}
