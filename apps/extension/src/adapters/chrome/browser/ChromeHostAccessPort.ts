import type { HostAccessPort } from '../../../ports/browser/HostAccessPort'

const ALL_SITES = { origins: ['<all_urls>'] }

export class ChromeHostAccessPort implements HostAccessPort {
  isGranted(): Promise<boolean> {
    return chrome.permissions.contains(ALL_SITES)
  }

  requestAccess(): Promise<boolean> {
    return chrome.permissions.request(ALL_SITES)
  }
}
