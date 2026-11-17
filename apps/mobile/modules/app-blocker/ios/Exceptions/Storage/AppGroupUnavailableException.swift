import ExpoModulesCore

final class AppGroupUnavailableException: Exception {
    override var code: String { "ERR_APP_GROUP_UNAVAILABLE" }

    override var reason: String {
        "O armazenamento compartilhado do app não está disponível. Reinstale o app."
    }
}
