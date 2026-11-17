import ManagedSettings

struct ShieldTargets {
    var applicationTokens: Set<ApplicationToken> = []
    var categoryTokens: Set<ActivityCategoryToken> = []
    var webDomainTokens: Set<WebDomainToken> = []
    var domains: Set<WebDomain> = []
}
