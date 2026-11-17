package expo.modules.appblocker.rules.exceptions

import expo.modules.kotlin.exception.CodedException

class AnotherAccountOwnsRulesException : CodedException(
  "ERR_ANOTHER_ACCOUNT_OWNS_RULES",
  "Este aparelho está protegido por outra conta. Entre com a conta original para mudar os bloqueios.",
  null,
)
