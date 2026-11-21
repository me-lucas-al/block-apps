public enum SelectionItemCount {
    public static func total(applications: Int, categories: Int, webDomains: Int) -> Int {
        return applications + categories + webDomains
    }
}
