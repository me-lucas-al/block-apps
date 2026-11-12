variable "name_prefix" {
  description = "Prefixo dos recursos, por exemplo block-apps-dev."
  type        = string
}

variable "deletion_protection" {
  description = "Impede apagar o user pool por engano. Ligue em produção."
  type        = bool
  default     = false
}

variable "hosted_domain_prefix" {
  description = "Prefixo único do domínio de login do Cognito (usado pelo login com Google)."
  type        = string
}

variable "web_callback_urls" {
  description = "URLs de retorno do login (painel admin), por exemplo http://localhost:5173."
  type        = list(string)
}

variable "google_client_id" {
  description = "ID do cliente OAuth do Google. Vazio desliga o login com Google."
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Chave secreta do cliente OAuth do Google."
  type        = string
  default     = ""
  sensitive   = true
}

variable "initial_admin_email" {
  description = "E-mail do primeiro administrador. Vazio não cria ninguém."
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags aplicadas aos recursos."
  type        = map(string)
  default     = {}
}
