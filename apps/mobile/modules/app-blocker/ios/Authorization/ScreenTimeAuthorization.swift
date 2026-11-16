import FamilyControls

enum ScreenTimeAuthorization {
    static func readStatus() -> AuthorizationStatusName {
        return AuthorizationStatusName(AuthorizationCenter.shared.authorizationStatus)
    }

    static func requestIndividualAuthorization() async throws -> AuthorizationStatusName {
        do {
            try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
        } catch {
            let reason: String = String(describing: error)
            AppLogger.authorization.error("Authorization failed: \(reason, privacy: .public)")
            throw error
        }
        return readStatus()
    }
}
