public enum SelectionLimits {
    public static let reportedMaximumApplications: Int = 50

    public static func exceedsReportedApplicationLimit(applicationCount: Int) -> Bool {
        return applicationCount > reportedMaximumApplications
    }
}
