import FamilyControls
import Foundation

extension SelectionSnapshot {
    init(selection: FamilyActivitySelection) {
        self.init(
            applications: Self.encodeTokens(selection.applicationTokens),
            categories: Self.encodeTokens(selection.categoryTokens),
            webDomains: Self.encodeTokens(selection.webDomainTokens)
        )
    }

    private static func encodeTokens<Token: Codable & Hashable>(_ tokens: Set<Token>) -> Set<String> {
        let encoder = JSONEncoder()
        let encodedTokens = tokens.compactMap { token in
            try? encoder.encode(token).base64EncodedString()
        }
        return Set(encodedTokens)
    }
}
