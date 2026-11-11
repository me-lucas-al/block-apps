import {
  SupabaseBlockRuleRepository,
  SupabaseDeviceRepository,
} from '@block-apps/api'
import { ChromeDeviceIdStore } from '../adapters/chrome/storage/ChromeDeviceIdStore'
import { ChromeDynamicRulesPort } from '../adapters/chrome/browser/ChromeDynamicRulesPort'
import { ChromeIncognitoPort } from '../adapters/chrome/browser/ChromeIncognitoPort'
import { ChromeStorageRuleCache } from '../adapters/chrome/storage/ChromeStorageRuleCache'
import { SupabaseSessionGate } from '../adapters/supabase/SupabaseSessionGate'
import { createSupabaseClient } from '../adapters/supabase/createSupabaseClient'
import { BlockingSynchronizer } from '../blocking/BlockingSynchronizer'
import { RulesRefresher } from '../blocking/RulesRefresher'
import { DeviceStatusReporter } from '../device/DeviceStatusReporter'

export function composeBackground() {
  const client = createSupabaseClient()
  const ruleCache = new ChromeStorageRuleCache()
  const sessionGate = new SupabaseSessionGate(client)

  const synchronizer = new BlockingSynchronizer({
    ruleCache,
    dynamicRules: new ChromeDynamicRulesPort(),
    now: () => new Date(),
  })

  const refresher = new RulesRefresher({
    repository: new SupabaseBlockRuleRepository(client),
    ruleCache,
    sessionGate,
    enforcer: synchronizer,
  })

  const reporter = new DeviceStatusReporter({
    deviceRepository: new SupabaseDeviceRepository(client),
    deviceIdStore: new ChromeDeviceIdStore(),
    incognito: new ChromeIncognitoPort(),
    sessionGate,
  })

  return { synchronizer, refresher, reporter }
}

export type BackgroundServices = ReturnType<typeof composeBackground>
