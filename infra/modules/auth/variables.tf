variable "name_prefix" {
  description = "Prefixo dos recursos, por exemplo block-apps-dev."
  type        = string
}

variable "deletion_protection" {
  description = "Impede apagar o user pool por engano. Ligue em produção."
  type        = bool
  default     = false
}

variable "allow_self_signup" {
  description = "Permite que qualquer pessoa crie conta. Desligado, só administradores criam usuários."
  type        = bool
  default     = true
}

variable "hosted_domain_prefix" {
  description = "Prefixo único do domínio de login do Cognito (usado pelo login com Google)."
  type        = string
}

variable "web_callback_urls" {
  description = "URLs de retorno do login do painel. Use https, exceto localhost em desenvolvimento."
  type        = list(string)

  validation {
    condition = alltrue([
      for url in var.web_callback_urls :
      startswith(url, "https://") || startswith(url, "http://localhost")
    ])
    error_message = "Use https fora de localhost."
  }
}

variable "web_logout_urls" {
  description = "URLs para onde o painel volta depois do logout."
  type        = list(string)

  validation {
    condition = alltrue([
      for url in var.web_logout_urls :
      startswith(url, "https://") || startswith(url, "http://localhost")
    ])
    error_message = "Use https fora de localhost."
  }
}

variable "google_client_id" {
  description = "ID do cliente OAuth do Google. Vazio desliga o login com Google."
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Chave secreta do cliente OAuth do Google. Passe por TF_VAR_google_client_secret."
  type        = string
  default     = ""
  sensitive   = true
}

variable "ses_identity_arn" {
  description = "ARN da identidade verificada no SES para enviar e-mails. Vazio usa o remetente padrão do Cognito (cerca de 50 e-mails por dia)."
  type        = string
  default     = ""
}

variable "ses_from_address" {
  description = "Endereço remetente quando o SES é usado."
  type        = string
  default     = ""
}

variable "initial_admin_email" {
  description = "E-mail do primeiro administrador, que recebe o convite do Cognito. Vazio não cria ninguém."
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags aplicadas aos recursos."
  type        = map(string)
  default     = {}
}
