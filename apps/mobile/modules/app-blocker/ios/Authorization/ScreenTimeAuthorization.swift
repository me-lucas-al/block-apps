import FamilyControls

enum ScreenTimeAuthorization {
    static func readStatusName() -> String {
        return statusName(AuthorizationCenter.shared.authorizationStatus)
    }

    static func requestIndividualAuthorization() async throws -> String {
        try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
        return readStatusName()
    }

    private static func statusName(_ status: AuthorizationStatus) -> String {
        switch status {
        case .approved: return "approved"
        case .denied: return "denied"
        default: return "notDetermined"
        }
    }
}
