import type { StrictModeAcceptancePort } from '../../../ports/strictmode/StrictModeAcceptancePort'
import type { IosNativeModule } from './module/IosNativeModule'

export class IosStrictModeAcceptanceAdapter implements StrictModeAcceptancePort {
  constructor(private readonly nativeModule: Pick<IosNativeModule, 'hasAcceptedStrictMode' | 'acceptStrictMode' | 'revokeStrictMode'>) {}

  hasAcceptedOnThisDevice(): boolean {
    return this.nativeModule.hasAcceptedStrictMode()
  }

  acceptOnThisDevice(): void {
    this.nativeModule.acceptStrictMode()
  }

  revokeOnThisDevice(): void {
    this.nativeModule.revokeStrictMode()
  }
}
