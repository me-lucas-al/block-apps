public enum RuleParsingError: Error, Equatable {
    case malformedDocument
    case invalidTimeOfDay(String)
}
