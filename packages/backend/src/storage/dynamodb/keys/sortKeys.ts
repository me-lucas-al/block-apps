export const RULE_SORT_PREFIX = 'RULE#'
export const CHANGE_SORT_PREFIX = 'CHANGE#'
export const SETTINGS_SORT_KEY = 'SETTINGS'
export const DNS_SORT_KEY = 'DNS'
export const DNS_TOKEN_SORT_KEY = 'DNSTOKEN'

export function ruleSortKey(ruleId: string): string {
  return `${RULE_SORT_PREFIX}${ruleId}`
}

export function changeSortKey(ruleId: string): string {
  return `${CHANGE_SORT_PREFIX}${ruleId}`
}

export function deviceSortKey(deviceId: string): string {
  return `DEVICE#${deviceId}`
}
