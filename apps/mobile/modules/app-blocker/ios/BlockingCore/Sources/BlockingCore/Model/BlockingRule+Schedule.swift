extension BlockingRule {
    public var followsTimeWindows: Bool {
        return !alwaysBlocked && !windows.isEmpty
    }
}
