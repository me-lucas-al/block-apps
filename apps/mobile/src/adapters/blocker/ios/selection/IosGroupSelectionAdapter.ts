import type {
  ChooseAppsOutcome,
  GroupSelectionPort,
  SelectionStatus,
} from '../../../../ports/groupselection/GroupSelectionPort'
import type { IosNativeModule } from '../module/IosNativeModule'
import { parseChooseAppsOutcome } from './parseChooseAppsOutcome'
import { parseSelectionStatus } from './parseSelectionStatus'

export type CurrentOwnerId = () => Promise<string | null>

export class IosGroupSelectionAdapter implements GroupSelectionPort {
  constructor(
    private readonly nativeModule: IosNativeModule,
    private readonly currentOwnerId: CurrentOwnerId,
  ) {}

  hasChosenApps(ruleId: string): boolean {
    return this.nativeModule.hasSelection(ruleId)
  }

  selectionStatusOf(ruleId: string): SelectionStatus {
    return parseSelectionStatus(this.nativeModule.getSelectionStatus(ruleId))
  }

  async chooseApps(ruleId: string): Promise<ChooseAppsOutcome> {
    const ownerId = await this.currentOwnerId()
    if (!ownerId) return 'notOwner'
    return parseChooseAppsOutcome(await this.nativeModule.presentAppSelectionPicker(ruleId, ownerId))
  }

  async holdPendingRemoval(ruleId: string, effectiveAtIso: string): Promise<void> {
    const ownerId = await this.currentOwnerId()
    if (!ownerId) throw new Error('Entre na sua conta para pedir a remoção do grupo.')
    this.nativeModule.holdPendingSelection(ruleId, effectiveAtIso, ownerId)
  }

  discardPendingRemoval(ruleId: string): void {
    this.nativeModule.discardPendingSelection(ruleId)
  }

  listUnscheduledRuleIds(): readonly string[] {
    return this.nativeModule.getUnscheduledRuleIds()
  }
}
