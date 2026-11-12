import type { BackgroundNotifier } from '../../../ports/browser/BackgroundNotifier'
import { RULES_CHANGED_MESSAGE } from '../../../shared/messages'

export class ChromeBackgroundNotifier implements BackgroundNotifier {
  notifyRulesChanged(): void {
    void chrome.runtime.sendMessage({ type: RULES_CHANGED_MESSAGE })
  }
}
