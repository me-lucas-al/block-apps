import XCTest
@testable import BlockingCore

final class WeekMomentTests: XCTestCase {
    private func utcCalendar() -> Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "UTC")!
        return calendar
    }

    func testReadsSundayAsZero() {
        let sundayNoon = Date(timeIntervalSince1970: 1_768_132_800)
        let moment = WeekMoment(date: sundayNoon, calendar: utcCalendar())
        XCTAssertEqual(moment, WeekMoment(dayOfWeek: 0, minuteOfDay: 12 * 60))
    }

    func testReadsMondayAfternoon() {
        let mondayAfternoon = Date(timeIntervalSince1970: 1_768_230_600)
        let moment = WeekMoment(date: mondayAfternoon, calendar: utcCalendar())
        XCTAssertEqual(moment, WeekMoment(dayOfWeek: 1, minuteOfDay: 15 * 60 + 10))
    }
}
