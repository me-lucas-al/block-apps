import { ChromeDeviceIdStore } from '../adapters/chrome/storage/ChromeDeviceIdStore'
import { ChromeDynamicRulesPort } from '../adapters/chrome/browser/ChromeDynamicRulesPort'
import { ChromeOpenTabsPort } from '../adapters/chrome/browser/ChromeOpenTabsPort'
import { createIncognitoPort } from '../adapters/browser/createIncognitoPort'
import { ChromeTabRedirectPort } from '../adapters/chrome/browser/ChromeTabRedirectPort'
import { ChromeStorageRuleCache } from '../adapters/chrome/storage/ChromeStorageRuleCache'
import { LocalSessionGate } from '../adapters/chrome/storage/LocalSessionGate'
import { createExtensionServices } from '../adapters/createExtensionServices'
import { BlockingSynchronizer } from '../blocking/BlockingSynchronizer'
import { OpenTabsBlocker } from '../blocking/OpenTabsBlocker'
import { RulesRefresher } from '../blocking/RulesRefresher'
import { SearchNavigationGuard } from '../blocking/keywords/SearchNavigationGuard'
import { DeviceStatusReporter } from '../device/DeviceStatusReporter'

export function composeBackground() {
  const services = createExtensionServices()
  const ruleCache = new ChromeStorageRuleCache()
  const sessionGate = new LocalSessionGate(services.session)

  const synchronizer = new BlockingSynchronizer({
    ruleCache,
    dynamicRules: new ChromeDynamicRulesPort(),
    openTabs: new OpenTabsBlocker(new ChromeOpenTabsPort()),
    now: () => new Date(),
  })

  const searchGuard = new SearchNavigationGuard({
    ruleCache,
    tabRedirect: new ChromeTabRedirectPort(),
    now: () => new Date(),
  })

  const refresher = new RulesRefresher({
    ruleRepository: services.ruleRepository,
    pendingRuleChanges: services.pendingRuleChanges,
    ruleCache,
    sessionGate,
    enforcer: synchronizer,
  })

  const reporter = new DeviceStatusReporter({
    deviceRepository: services.deviceRepository,
    deviceIdStore: new ChromeDeviceIdStore(),
    incognito: createIncognitoPort(),
    sessionGate,
  })

  return { synchronizer, refresher, reporter, searchGuard, authenticator: services.authenticator }
}

export type BackgroundServices = ReturnType<typeof composeBackground>
