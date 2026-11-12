export type RedirectRule = {
  readonly id: number
  readonly priority: number
  readonly action: {
    readonly type: 'redirect'
    readonly redirect: { readonly extensionPath: string }
  }
  readonly condition: {
    readonly requestDomains: readonly string[]
    readonly resourceTypes: readonly ['main_frame']
  }
}

export interface DynamicRulesPort {
  listIds(): Promise<number[]>
  replace(
    removeIds: readonly number[],
    addRules: readonly RedirectRule[],
  ): Promise<void>
}
