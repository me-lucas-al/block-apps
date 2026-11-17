import Foundation

public struct WeekMoment: Equatable, Sendable {
    public let dayOfWeek: Int
    public let minuteOfDay: Int

    public init(dayOfWeek: Int, minuteOfDay: Int) {
        self.dayOfWeek = dayOfWeek
        self.minuteOfDay = minuteOfDay
    }

    public init(date: Date, calendar: Calendar) {
        let parts: DateComponents = calendar.dateComponents([.weekday, .hour, .minute], from: date)
        self.dayOfWeek = (parts.weekday ?? 1) - 1
        self.minuteOfDay = (parts.hour ?? 0) * 60 + (parts.minute ?? 0)
    }
}
