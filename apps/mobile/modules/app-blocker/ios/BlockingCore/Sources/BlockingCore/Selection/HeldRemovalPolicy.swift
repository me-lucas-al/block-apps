import Foundation

public enum HeldRemovalDecision: Equatable, Sendable {
    case keep
    case commit
    case discard
}

public enum HeldRemovalPolicy {
    public static func decide(
        holdEffectiveAt: Date?,
        hasPendingServerChange: Bool,
        serverNow: Date?
    ) -> HeldRemovalDecision {
        guard let holdEffectiveAt: Date = holdEffectiveAt else { return .keep }
        if hasPendingServerChange { return .keep }
        guard let serverNow: Date = serverNow else { return .keep }
        return serverNow >= holdEffectiveAt ? .commit : .discard
    }
}
