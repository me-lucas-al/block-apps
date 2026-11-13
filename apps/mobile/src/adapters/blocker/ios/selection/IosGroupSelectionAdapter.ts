import type {
  ChooseAppsOutcome,
  GroupSelectionPort,
} from '../../../../ports/groupselection/GroupSelectionPort'
import type { IosNativeModule } from '../module/IosNativeModule'
import { parseChooseAppsOutcome } from './parseChooseAppsOutcome'

export class IosGroupSelectionAdapter implements GroupSelectionPort {
  constructor(private readonly nativeModule: IosNativeModule) {}

  hasChosenApps(ruleId: string): boolean {
    return this.nativeModule.hasSelection(ruleId)
  }

  async chooseApps(ruleId: string): Promise<ChooseAppsOutcome> {
    return parseChooseAppsOutcome(await this.nativeModule.presentAppSelectionPicker(ruleId))
  }

  hasPendingRemoval(ruleId: string): boolean {
    return this.nativeModule.hasPendingSelectionRemoval(ruleId)
  }

  holdPendingRemoval(ruleId: string, effectiveAtIso: string): void {
    this.nativeModule.holdPendingSelection(ruleId, effectiveAtIso)
  }

  readPendingRemovalHold(ruleId: string): string | null {
    return this.nativeModule.getPendingSelectionHold(ruleId)
  }

  commitPendingRemoval(ruleId: string): void {
    this.nativeModule.commitPendingSelection(ruleId)
  }

  discardPendingRemoval(ruleId: string): void {
    this.nativeModule.discardPendingSelection(ruleId)
  }

  listUnscheduledRuleIds(): readonly string[] {
    return this.nativeModule.getUnscheduledRuleIds()
  }
}
