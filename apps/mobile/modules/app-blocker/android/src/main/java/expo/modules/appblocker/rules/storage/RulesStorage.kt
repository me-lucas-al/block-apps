package expo.modules.appblocker.rules.storage

interface RulesStorage {
  fun readRulesJson(): String?

  fun saveRulesJson(rulesJson: String)

  fun readOwnerId(): String?

  fun saveOwnerId(ownerId: String)
}
