export interface SessionGate {
  hasSession(): Promise<boolean>
}
