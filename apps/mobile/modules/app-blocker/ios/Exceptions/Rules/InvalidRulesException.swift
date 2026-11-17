import ExpoModulesCore

final class InvalidRulesException: Exception {
    override var code: String { "ERR_INVALID_RULES" }

    override var reason: String {
        "As regras recebidas do servidor não puderam ser lidas. Tente sincronizar de novo."
    }
}
