import type { ProtectionCheck, ProtectionPort } from '../../../ports/protection/ProtectionPort'
import type { AndroidNativeModule } from './AndroidNativeModule'

type ProtectionNativeModule = Pick<
  AndroidNativeModule,
  | 'isAccessibilityEnabled'
  | 'openAccessibilitySettings'
  | 'isDeviceAdminActive'
  | 'requestDeviceAdmin'
>

export class AndroidProtectionAdapter implements ProtectionPort {
  constructor(private readonly nativeModule: ProtectionNativeModule) {}

  listChecks(): readonly ProtectionCheck[] {
    return [
      {
        id: 'accessibility',
        title: 'Serviço de acessibilidade',
        description: 'Necessário para detectar e bloquear os apps.',
        active: this.nativeModule.isAccessibilityEnabled(),
        actionLabel: 'Ativar',
        performAction: () => this.nativeModule.openAccessibilitySettings(),
      },
      {
        id: 'device-admin',
        title: 'Proteção contra desinstalação',
        description: 'Exige desativar o administrador antes de desinstalar.',
        active: this.nativeModule.isDeviceAdminActive(),
        actionLabel: 'Ativar',
        performAction: () => this.nativeModule.requestDeviceAdmin(),
      },
    ]
  }

  isDeviceProtected(): boolean {
    return this.nativeModule.isDeviceAdminActive()
  }
}
