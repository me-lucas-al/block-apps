import FamilyControls

enum AuthorizationStatusName: String {
    case approved
    case denied
    case notDetermined

    init(_ status: AuthorizationStatus) {
        switch status {
        case .approved: self = .approved
        case .denied: self = .denied
        case .notDetermined: self = .notDetermined
        @unknown default: self = .notDetermined
        }
    }
}
