export interface HostAccessPort {
  isGranted(): Promise<boolean>
  requestAccess(): Promise<boolean>
}
