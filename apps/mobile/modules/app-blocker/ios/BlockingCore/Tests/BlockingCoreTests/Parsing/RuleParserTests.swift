import XCTest
@testable import BlockingCore

final class RuleParserTests: XCTestCase {
    private let scheduledGroupJSON: String = """
    [{"id":"iosSelection~social","targetType":"iosSelection","target":"social","mode":"schedule",
      "windows":[{"days":[1,2],"start":"18:00","end":"20:30"}]}]
    """

    func testParsesScheduledRuleWithMinutes() throws {
        let rules: [BlockingRule] = try RuleParser.parseRules(fromJSON: scheduledGroupJSON)
        XCTAssertEqual(rules, [
            BlockingRule(
                id: "iosSelection~social",
                kind: .iosSelection,
                target: "social",
                alwaysBlocked: false,
                windows: [TimeWindow(days: [1, 2], startMinute: 1080, endMinute: 1230)]
            )
        ])
    }

    func testParsesAlwaysRule() throws {
        let json: String = """
        [{"id":"site~example.com","targetType":"site","target":"example.com","mode":"always","windows":[]}]
        """
        let rules: [BlockingRule] = try RuleParser.parseRules(fromJSON: json)
        XCTAssertEqual(rules.first?.alwaysBlocked, true)
        XCTAssertEqual(rules.first?.kind, .site)
    }

    func testSkipsUnknownTargetTypes() throws {
        let json: String = """
        [{"id":"x","targetType":"hologram","target":"x","mode":"always","windows":[]}]
        """
        XCTAssertEqual(try RuleParser.parseRules(fromJSON: json), [])
    }

    func testParsesEmptyArray() throws {
        XCTAssertEqual(try RuleParser.parseRules(fromJSON: "[]"), [])
    }

    func testRejectsMalformedJSON() {
        XCTAssertThrowsError(try RuleParser.parseRules(fromJSON: "{oops")) { (error: Error) in
            XCTAssertEqual(error as? RuleParsingError, .malformedDocument)
        }
    }

    func testRejectsInvalidTimeOfDay() {
        let json: String = """
        [{"id":"x","targetType":"site","target":"a.com","mode":"schedule",
          "windows":[{"days":[1],"start":"25:00","end":"26:00"}]}]
        """
        XCTAssertThrowsError(try RuleParser.parseRules(fromJSON: json)) { (error: Error) in
            XCTAssertEqual(error as? RuleParsingError, .invalidTimeOfDay("25:00"))
        }
    }

    func testRejectsAWeekdayOutsideTheWeek() {
        let json: String = """
        [{"id":"a","targetType":"site","target":"a.com","mode":"schedule","windows":[{"days":[7],"start":"09:00","end":"10:00"}]}]
        """
        XCTAssertThrowsError(try RuleParser.parseRules(fromJSON: json)) { (error: Error) in
            XCTAssertEqual(error as? RuleParsingError, .invalidDay(7))
        }
    }
}
