import ExpoModulesCore

enum NativeExceptionMapper {
    static func run<Value>(_ body: () throws -> Value) throws -> Value {
        do {
            return try body()
        } catch {
            throw exception(for: error)
        }
    }

    static func runAsync<Value>(_ body: () async throws -> Value) async throws -> Value {
        do {
            return try await body()
        } catch {
            throw exception(for: error)
        }
    }

    static func exception(for error: Error) -> Error {
        switch error {
        case InstallRulesError.anotherAccountOwnsTheRules: return AnotherAccountOwnsRulesException()
        case is RuleParsingError: return InvalidRulesException()
        case is ScheduleRegistrationError: return ScheduleRegistrationFailedException()
        case SharedStorageError.appGroupUnavailable: return AppGroupUnavailableException()
        case SharedStorageError.selectionNotSaved: return SelectionNotSavedException()
        case PickerNotPresentedError.noViewControllerAvailable: return PickerNotPresentedException()
        default: return error
        }
    }
}
