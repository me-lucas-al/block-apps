import Foundation

public enum IsoInstantParser {
    public static func parse(_ text: String) -> Date? {
        let withFraction: ISO8601DateFormatter = ISO8601DateFormatter()
        withFraction.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date: Date = withFraction.date(from: text) { return date }
        let withoutFraction: ISO8601DateFormatter = ISO8601DateFormatter()
        withoutFraction.formatOptions = [.withInternetDateTime]
        return withoutFraction.date(from: text)
    }
}
