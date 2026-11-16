import FamilyControls

enum SelectionLoadResult {
    case absent
    case unreadable
    case found(FamilyActivitySelection)

    var selection: FamilyActivitySelection? {
        switch self {
        case .found(let found): return found
        case .absent, .unreadable: return nil
        }
    }

    var statusName: String {
        switch self {
        case .absent: return "absent"
        case .unreadable: return "unreadable"
        case .found: return "found"
        }
    }
}
