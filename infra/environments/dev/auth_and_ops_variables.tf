variable "ses_identity_arn" {
  description = "ARN da identidade verificada no SES para envio de e-mails em produção."
  type        = string
  default     = ""
}

variable "ses_from_address" {
  description = "Endereço de e-mail remetente verificado no SES."
  type        = string
  default     = ""
}

variable "extension_ids" {
  description = "Lista de IDs das extensões Chromium autorizadas para login OAuth."
  type        = list(string)
  default     = []
}

variable "admin_require_mfa" {
  description = "Exige MFA TOTP ativo para que administradores acessem rotas do painel."
  type        = bool
  default     = true
}

variable "budget_limit_usd" {
  description = "Limite do orçamento mensal em USD no AWS Budgets. 0 desliga."
  type        = number
  default     = 0
}

variable "budget_alert_email" {
  description = "E-mail para envio de alertas do orçamento mensal."
  type        = string
  default     = ""
}
