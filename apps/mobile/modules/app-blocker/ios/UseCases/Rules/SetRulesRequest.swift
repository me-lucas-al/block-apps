import ExpoModulesCore

struct SetRulesRequest: Record {
    @Field var rulesJson: String = ""
    @Field var ownerId: String = ""
    @Field var pendingRuleIds: [String] = []
    @Field var serverNowIso: String?
    @Field var legacyOwnerId: String?
}
