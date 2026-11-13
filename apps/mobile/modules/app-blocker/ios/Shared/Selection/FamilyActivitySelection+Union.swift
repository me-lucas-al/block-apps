import FamilyControls

extension FamilyActivitySelection {
    func unioned(with other: FamilyActivitySelection) -> FamilyActivitySelection {
        var merged = self
        merged.applicationTokens.formUnion(other.applicationTokens)
        merged.categoryTokens.formUnion(other.categoryTokens)
        merged.webDomainTokens.formUnion(other.webDomainTokens)
        return merged
    }
}
