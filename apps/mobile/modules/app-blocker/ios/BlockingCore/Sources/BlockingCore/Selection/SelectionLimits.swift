public enum SelectionLimits {
    public static let reportedMaximumItems: Int = 50

    public static func exceedsReportedLimit(itemCount: Int) -> Bool {
        return itemCount > reportedMaximumItems
    }
}
