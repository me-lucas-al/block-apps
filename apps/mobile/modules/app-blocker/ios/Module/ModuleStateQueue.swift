import Foundation

enum ModuleStateQueue {
    private static let serial: DispatchQueue = DispatchQueue(label: "com.blockapps.mobile.module-state")

    static func run<Value>(_ body: () throws -> Value) rethrows -> Value {
        return try serial.sync(execute: body)
    }
}
