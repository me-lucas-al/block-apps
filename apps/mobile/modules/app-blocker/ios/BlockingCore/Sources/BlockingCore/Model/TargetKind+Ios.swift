extension TargetKind {
    public var isEnforcedOnIos: Bool {
        return self == .iosSelection || self == .site
    }
}
