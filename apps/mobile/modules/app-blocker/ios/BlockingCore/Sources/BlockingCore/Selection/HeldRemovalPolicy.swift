import Foundation

public enum HeldRemovalDecision: Equatable, Sendable {
    case keep
    case commit
    case discard
}

public enum HeldRemovalPolicy {
    public static let serverClockToleranceSeconds: TimeInterval = 1

    public static func decide(
        holdEffectiveAt: Date?,
        hasPendingServerChange: Bool,
        serverNow: Date?
    ) -> HeldRemovalDecision {
        guard let holdEffectiveAt: Date = holdEffectiveAt else { return .keep }
        if hasPendingServerChange { return .keep }
        guard let serverNow: Date = serverNow else { return .keep }
        let secondsUntilEffective: TimeInterval = holdEffectiveAt.timeIntervalSince(serverNow)
        return secondsUntilEffective <= serverClockToleranceSeconds ? .commit : .discard
    }
}
