public enum RulesOwnershipDecision: Equatable, Sendable {
    case accept
    case rejectBecauseAnotherAccountOwnsTheRules
}

public enum RulesOwnershipPolicy {
    public static func decide(
        storedOwnerId: String?,
        incomingOwnerId: String,
        hasStoredRules: Bool
    ) -> RulesOwnershipDecision {
        guard let storedOwnerId: String = storedOwnerId else { return .accept }
        if storedOwnerId == incomingOwnerId { return .accept }
        return hasStoredRules ? .rejectBecauseAnotherAccountOwnsTheRules : .accept
    }
}
