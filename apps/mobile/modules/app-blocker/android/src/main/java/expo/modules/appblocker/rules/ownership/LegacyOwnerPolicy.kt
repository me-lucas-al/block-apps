package expo.modules.appblocker.rules.ownership

object LegacyOwnerPolicy {
  fun shouldMigrate(storedOwnerId: String?, legacyOwnerId: String?, incomingOwnerId: String): Boolean {
    if (storedOwnerId == null || legacyOwnerId == null) return false
    if (storedOwnerId == incomingOwnerId) return false
    return storedOwnerId == legacyOwnerId
  }
}
