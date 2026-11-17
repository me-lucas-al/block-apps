import type { ProtectionCheck, ProtectionPort } from '../../../ports/protection/ProtectionPort'
import type { IosNativeModule } from './module/IosNativeModule'

type ProtectionNativeModule = Pick<
  IosNativeModule,
  'getAuthorizationStatus' | 'requestScreenTimeAuthorization'
>

export class IosProtectionAdapter implements ProtectionPort {
  constructor(private readonly nativeModule: ProtectionNativeModule) {}

  listChecks(): readonly ProtectionCheck[] {
    return [
      {
        id: 'screen-time-authorization',
        title: 'Autorização do Tempo de Uso',
        description: 'Necessária para bloquear apps e sites. Sem ela nada é bloqueado.',
        active: this.isDeviceProtected(),
        actionLabel: 'Autorizar',
        performAction: async () => {
          await this.nativeModule.requestScreenTimeAuthorization()
        },
      },
    ]
  }

  isDeviceProtected(): boolean {
    return this.nativeModule.getAuthorizationStatus() === 'approved'
  }
}
