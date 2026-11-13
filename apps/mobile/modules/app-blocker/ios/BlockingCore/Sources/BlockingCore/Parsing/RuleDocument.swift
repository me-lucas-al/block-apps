struct RuleDocument: Decodable {
    let id: String
    let targetType: String
    let target: String
    let mode: String
    let windows: [WindowDocument]
}

struct WindowDocument: Decodable {
    let days: [Int]
    let start: String
    let end: String
}
