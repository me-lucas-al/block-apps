import type { HostAccessPort } from '../../ports/browser/HostAccessPort'

export type HostAccessActions = {
  readonly loadGrantedState: () => Promise<void>
  readonly requestAccess: () => Promise<void>
}

export function createHostAccessActions(
  hostAccess: HostAccessPort,
  onGrantedChange: (granted: boolean) => void,
): HostAccessActions {
  return {
    loadGrantedState: async () => onGrantedChange(await hostAccess.isGranted()),
    requestAccess: async () => onGrantedChange(await hostAccess.requestAccess()),
  }
}
