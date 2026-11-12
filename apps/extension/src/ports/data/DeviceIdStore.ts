export interface DeviceIdStore {
  getOrCreate(): Promise<string>
}
