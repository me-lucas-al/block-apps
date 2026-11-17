import ManagedSettings

struct ShieldTargetsBuilder {
    private let selectionStorage: SelectionStorage

    init(selectionStorage: SelectionStorage) {
        self.selectionStorage = selectionStorage
    }

    func buildTargets(for blockedRules: [BlockingRule]) -> ShieldTargets {
        var targets = ShieldTargets()
        for rule in blockedRules {
            switch rule.kind {
            case .iosSelection:
                addSelection(of: rule, to: &targets)
            case .site:
                targets.domains.insert(WebDomain(domain: rule.target))
            default:
                continue
            }
        }
        return targets
    }

    private func addSelection(of rule: BlockingRule, to targets: inout ShieldTargets) {
        guard let selection = selectionStorage.loadSelection(ruleId: rule.id) else { return }
        targets.applicationTokens.formUnion(selection.applicationTokens)
        targets.categoryTokens.formUnion(selection.categoryTokens)
        targets.webDomainTokens.formUnion(selection.webDomainTokens)
    }
}
