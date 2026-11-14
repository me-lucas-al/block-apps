import ManagedSettings

struct ShieldSettingsWriter {
    private let store: ManagedSettingsStore

    init(store: ManagedSettingsStore) {
        self.store = store
    }

    func writeShields(_ targets: ShieldTargets) {
        let categories = targets.categoryTokens
        store.shield.applications = targets.applicationTokens.isEmpty ? nil : targets.applicationTokens
        store.shield.applicationCategories = categories.isEmpty ? nil : .specific(categories)
        store.shield.webDomains = targets.webDomainTokens.isEmpty ? nil : targets.webDomainTokens
        store.shield.webDomainCategories = categories.isEmpty ? nil : .specific(categories)
        store.webContent.blockedByFilter = targets.domains.isEmpty ? nil : .specific(targets.domains)
    }

    func requireAutomaticDateAndTime(_ required: Bool) {
        store.dateAndTime.requireAutomaticDateAndTime = required ? true : nil
    }

    func denyAppRemoval(_ denied: Bool) {
        store.application.denyAppRemoval = denied ? true : nil
    }
}
