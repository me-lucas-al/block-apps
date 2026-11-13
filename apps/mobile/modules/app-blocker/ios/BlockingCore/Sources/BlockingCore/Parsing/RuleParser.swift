import Foundation

public enum RuleParser {
    public static func parseRules(fromJSON json: String) throws -> [BlockingRule] {
        let documents = try decodeDocuments(json)
        return try documents.compactMap { document in
            try toRule(document)
        }
    }

    private static func decodeDocuments(_ json: String) throws -> [RuleDocument] {
        do {
            return try JSONDecoder().decode([RuleDocument].self, from: Data(json.utf8))
        } catch {
            throw RuleParsingError.malformedDocument
        }
    }

    private static func toRule(_ document: RuleDocument) throws -> BlockingRule? {
        guard let kind = TargetKind(rawValue: document.targetType) else { return nil }
        return BlockingRule(
            id: document.id,
            kind: kind,
            target: document.target,
            alwaysBlocked: document.mode == "always",
            windows: try document.windows.map(toWindow)
        )
    }

    private static func toWindow(_ document: WindowDocument) throws -> TimeWindow {
        return TimeWindow(
            days: Set(document.days),
            startMinute: try MinuteOfDayParser.parseMinuteOfDay(document.start),
            endMinute: try MinuteOfDayParser.parseMinuteOfDay(document.end)
        )
    }
}
