public protocol OwnerStoring {
    func loadOwnerId() -> String?
    func saveOwnerId(_ ownerId: String) throws
}
