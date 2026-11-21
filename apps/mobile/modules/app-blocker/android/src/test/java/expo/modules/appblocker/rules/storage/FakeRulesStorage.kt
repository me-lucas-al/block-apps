package expo.modules.appblocker.rules.storage

class FakeRulesStorage(var rulesJson: String? = null, var ownerId: String? = null) : RulesStorage {
  override fun readRulesJson() = rulesJson

  override fun saveRulesJson(rulesJson: String) {
    this.rulesJson = rulesJson
  }

  override fun readOwnerId() = ownerId

  override fun saveOwnerId(ownerId: String) {
    this.ownerId = ownerId
  }
}
