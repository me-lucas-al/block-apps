import ExpoModulesCore

final class AnotherAccountOwnsRulesException: Exception {
    override var reason: String {
        "Este aparelho está protegido por outra conta. Entre com a conta original para mudar os bloqueios."
    }
}
