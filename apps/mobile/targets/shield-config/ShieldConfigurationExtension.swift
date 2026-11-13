import ManagedSettings
import ManagedSettingsUI
import UIKit

class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return makeBlockedConfiguration()
    }

    override func configuration(
        shielding application: Application,
        in category: ActivityCategory
    ) -> ShieldConfiguration {
        return makeBlockedConfiguration()
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return makeBlockedConfiguration()
    }

    override func configuration(
        shielding webDomain: WebDomain,
        in category: ActivityCategory
    ) -> ShieldConfiguration {
        return makeBlockedConfiguration()
    }

    private func makeBlockedConfiguration() -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemMaterial,
            backgroundColor: nil,
            icon: nil,
            title: ShieldConfiguration.Label(text: ShieldTexts.title, color: .label),
            subtitle: ShieldConfiguration.Label(text: ShieldTexts.subtitle, color: .secondaryLabel),
            primaryButtonLabel: ShieldConfiguration.Label(text: ShieldTexts.closeButtonLabel, color: .white),
            primaryButtonBackgroundColor: .systemBlue,
            secondaryButtonLabel: nil
        )
    }
}
