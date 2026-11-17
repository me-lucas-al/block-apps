import os

enum AppLogger {
    private static let subsystem: String = "com.blockapps.mobile"

    static let storage: Logger = Logger(subsystem: subsystem, category: "storage")
    static let schedule: Logger = Logger(subsystem: subsystem, category: "schedule")
    static let selection: Logger = Logger(subsystem: subsystem, category: "selection")
    static let authorization: Logger = Logger(subsystem: subsystem, category: "authorization")
}
