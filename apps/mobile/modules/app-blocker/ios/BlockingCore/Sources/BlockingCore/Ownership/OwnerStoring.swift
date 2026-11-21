public protocol OwnerStoring {
    func loadOwnerId() -> String?
    func loadStoredRuleIds() -> Set<String>?
    func saveOwnerId(_ ownerId: String) throws
}
