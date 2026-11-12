variable "admin_require_mfa" {
  description = "Exige MFA TOTP ativo para os administradores acessarem rotas administrativas."
  type        = bool
  default     = true
}

variable "budget_limit_usd" {
  description = "Limite do orçamento mensal em USD para alerta no AWS Budgets. 0 desliga."
  type        = number
  default     = 0
}

variable "budget_alert_email" {
  description = "E-mail para envio de alertas de orçamento do AWS Budgets."
  type        = string
  default     = ""
}
