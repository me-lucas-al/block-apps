export interface DohUpstream {
  forwardQuery(wireQuery: Uint8Array): Promise<Uint8Array>
}
