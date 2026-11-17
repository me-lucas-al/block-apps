import ExpoModulesCore

final class PickerNotPresentedException: Exception {
    override var code: String { "ERR_PICKER_NOT_PRESENTED" }

    override var reason: String {
        "Não foi possível abrir a escolha de apps agora. Volte ao app e tente de novo."
    }
}
