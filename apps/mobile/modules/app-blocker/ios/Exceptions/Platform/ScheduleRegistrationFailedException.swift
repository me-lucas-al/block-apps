import ExpoModulesCore

final class ScheduleRegistrationFailedException: Exception {
    override var code: String { "ERR_SCHEDULE_REGISTRATION_FAILED" }

    override var reason: String {
        "Não foi possível agendar os horários no iPhone. Os apps com horário ficam bloqueados até dar certo."
    }
}
