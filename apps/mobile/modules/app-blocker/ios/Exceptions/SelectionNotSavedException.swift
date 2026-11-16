import ExpoModulesCore

final class SelectionNotSavedException: Exception {
    override var code: String { "ERR_SELECTION_NOT_SAVED" }

    override var reason: String {
        "Não foi possível guardar a escolha de apps. Tente escolher de novo."
    }
}
