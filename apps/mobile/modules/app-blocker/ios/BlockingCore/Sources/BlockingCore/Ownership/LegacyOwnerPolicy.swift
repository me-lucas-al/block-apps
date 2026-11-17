public enum LegacyOwnerPolicy {
    public static func shouldMigrate(
        storedOwnerId: String?,
        legacyOwnerId: String?,
        incomingOwnerId: String
    ) -> Bool {
        guard let storedOwnerId: String = storedOwnerId, let legacyOwnerId: String = legacyOwnerId else {
            return false
        }
        if storedOwnerId == incomingOwnerId { return false }
        return storedOwnerId == legacyOwnerId
    }
}
