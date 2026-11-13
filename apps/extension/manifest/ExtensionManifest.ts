export type ServiceWorkerBackground = {
  readonly service_worker: string
  readonly type: 'module'
}

export type EventPageBackground = {
  readonly scripts: readonly string[]
  readonly type: 'module'
}

export type GeckoCollectedData = 'authenticationInfo' | 'personallyIdentifyingInfo'

export type GeckoSettings = {
  readonly id: string
  readonly strict_min_version: string
  readonly data_collection_permissions: { readonly required: readonly GeckoCollectedData[] }
}

export type ExtensionManifest = {
  readonly manifest_version: 3
  readonly name: string
  readonly version: string
  readonly description: string
  readonly minimum_chrome_version?: string
  readonly action: { readonly default_popup: string; readonly default_title: string }
  readonly background: ServiceWorkerBackground | EventPageBackground
  readonly permissions: readonly string[]
  readonly host_permissions: readonly string[]
  readonly optional_host_permissions?: readonly string[]
  readonly incognito: 'spanning'
  readonly web_accessible_resources: ReadonlyArray<{
    readonly resources: readonly string[]
    readonly matches: readonly string[]
  }>
  readonly browser_specific_settings?: {
    readonly gecko: GeckoSettings
    readonly gecko_android?: { readonly strict_min_version: string }
  }
}
