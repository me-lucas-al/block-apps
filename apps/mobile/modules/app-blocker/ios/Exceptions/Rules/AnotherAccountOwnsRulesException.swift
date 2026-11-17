import ExpoModulesCore

final class AnotherAccountOwnsRulesException: Exception {
    override var code: String { "ERR_ANOTHER_ACCOUNT_OWNS_RULES" }

    override var reason: String {
        "Este aparelho está protegido por outra conta. Entre com a conta original para mudar os bloqueios."
    }
}
