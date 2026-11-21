package expo.modules.appblocker.rules.storage

import expo.modules.appblocker.rules.ownership.LegacyOwnerPolicy
import expo.modules.appblocker.rules.ownership.RulesOwnedByAnotherAccountException
import expo.modules.appblocker.rules.ownership.RulesOwnershipDecision
import expo.modules.appblocker.rules.ownership.RulesOwnershipPolicy

class RulesInstaller(private val storage: RulesStorage) {
  fun install(rulesJson: String, ownerId: String, legacyOwnerId: String?) {
    RuleParser.parse(rulesJson)
    migrateLegacyOwner(rulesJson, ownerId, legacyOwnerId)
    requireOwnership(ownerId)
    storage.saveOwnerId(ownerId)
    storage.saveRulesJson(rulesJson)
  }

  private fun migrateLegacyOwner(rulesJson: String, ownerId: String, legacyOwnerId: String?) {
    val shouldMigrate = LegacyOwnerPolicy.shouldMigrate(
      storedOwnerId = storage.readOwnerId(),
      legacyOwnerId = legacyOwnerId,
      incomingOwnerId = ownerId,
      storedRuleIds = readStoredRuleIds(),
      incomingRuleIds = RuleIdReader.readIds(rulesJson) ?: emptySet(),
    )
    if (shouldMigrate) storage.saveOwnerId(ownerId)
  }

  private fun readStoredRuleIds(): Set<String>? {
    val storedRulesJson = storage.readRulesJson() ?: return emptySet()
    return RuleIdReader.readIds(storedRulesJson)
  }

  private fun hasAnyRule(rulesJson: String): Boolean =
    runCatching { RuleParser.parse(rulesJson).isNotEmpty() }.getOrDefault(true)

  private fun requireOwnership(ownerId: String) {
    val storedRulesJson = storage.readRulesJson()
    val hasStoredRules = storedRulesJson != null && hasAnyRule(storedRulesJson)
    val decision = RulesOwnershipPolicy.decide(storage.readOwnerId(), ownerId, hasStoredRules)
    if (decision == RulesOwnershipDecision.REJECT_BECAUSE_ANOTHER_ACCOUNT_OWNS_THE_RULES) {
      throw RulesOwnedByAnotherAccountException()
    }
  }
}
