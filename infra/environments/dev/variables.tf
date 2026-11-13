variable "aws_region" {
  description = "Região da AWS."
  type        = string
  default     = "sa-east-1"
}

variable "environment_name" {
  description = "Nome do ambiente. Este diretório é o ambiente de desenvolvimento; produção terá o seu próprio diretório."
  type        = string
  default     = "dev"
}

variable "lambda_zip_path" {
  description = "Caminho do pacote .zip da API, relativo a esta pasta (gerado por `pnpm --filter @block-apps/backend package`)."
  type        = string
  default     = "../../../packages/backend/dist/lambda.zip"
}

variable "hosted_domain_prefix" {
  description = "Prefixo único do domínio de login do Cognito. Sem valor padrão: passe por TF_VAR_hosted_domain_prefix."
  type        = string
}

variable "allowed_origins" {
  description = "Origens autorizadas no CORS da API."
  type        = list(string)
  default     = ["http://localhost:5173", "http://localhost:8080"]
}

variable "allow_self_signup" {
  description = "Permite que qualquer pessoa crie conta pelo app. Desligado, só administradores criam usuários."
  type        = bool
  default     = true
}

variable "google_client_id" {
  description = "ID do cliente OAuth do Google (vazio desliga o login com Google)."
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Chave secreta do cliente OAuth do Google. Passe por TF_VAR_google_client_secret."
  type        = string
  default     = ""
  sensitive   = true
}

variable "initial_admin_email" {
  description = "E-mail do primeiro administrador, que recebe o convite do Cognito (vazio não cria ninguém)."
  type        = string
  default     = ""
}

variable "protect_from_deletion" {
  description = "Liga a proteção contra exclusão da tabela e do user pool na AWS."
  type        = bool
  default     = false
}
