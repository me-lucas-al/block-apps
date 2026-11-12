variable "aws_region" {
  description = "Região da AWS."
  type        = string
  default     = "sa-east-1"
}

variable "environment_name" {
  description = "Nome do ambiente, por exemplo dev ou prod."
  type        = string
  default     = "dev"
}

variable "lambda_zip_path" {
  description = "Caminho do pacote .zip da API (gerado por `pnpm --filter @block-apps/backend package`)."
  type        = string
  default     = "../../../packages/backend/dist/lambda.zip"
}

variable "hosted_domain_prefix" {
  description = "Prefixo único do domínio de login do Cognito."
  type        = string
}

variable "web_callback_urls" {
  description = "URLs de retorno do painel administrativo."
  type        = list(string)
  default     = ["http://localhost:5173", "http://localhost:8080"]
}

variable "allowed_origins" {
  description = "Origens autorizadas no CORS da API."
  type        = list(string)
  default     = ["http://localhost:5173", "http://localhost:8080"]
}

variable "google_client_id" {
  description = "ID do cliente OAuth do Google (vazio desliga o login com Google)."
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
  description = "E-mail do primeiro administrador (vazio não cria ninguém)."
  type        = string
  default     = ""
}

variable "protect_from_deletion" {
  description = "Liga a proteção contra exclusão da tabela e do user pool."
  type        = bool
  default     = false
}
