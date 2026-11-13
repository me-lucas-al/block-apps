variable "name_prefix" {
  description = "Prefixo dos recursos, por exemplo block-apps-dev."
  type        = string
}

variable "lambda_zip_path" {
  description = "Caminho do pacote .zip da API gerado por `pnpm --filter @block-apps/backend package`."
  type        = string
}

variable "table_name" {
  description = "Nome da tabela DynamoDB."
  type        = string
}

variable "table_arn" {
  description = "ARN da tabela DynamoDB."
  type        = string
}

variable "due_changes_index_arn" {
  description = "ARN do índice das mudanças pendentes."
  type        = string
}

variable "user_pool_id" {
  description = "ID do user pool do Cognito."
  type        = string
}

variable "user_pool_arn" {
  description = "ARN do user pool do Cognito."
  type        = string
}

variable "issuer_url" {
  description = "Issuer dos tokens do Cognito."
  type        = string
}

variable "client_ids" {
  description = "Clients do Cognito aceitos como audience."
  type        = list(string)
}

variable "allowed_origins" {
  description = "Origens autorizadas no CORS (painel admin)."
  type        = list(string)
}

variable "lambda_memory_mb" {
  description = "Memória da Lambda. Mais memória também dá mais CPU e acelera a partida a frio."
  type        = number
  default     = 512
}

variable "log_retention_days" {
  description = "Dias de retenção dos logs."
  type        = number
  default     = 30
}

variable "max_rules_per_user" {
  description = "Quantidade máxima de regras por usuário. Acima disso a criação de regra responde 422."
  type        = number
  default     = 200

  validation {
    condition     = var.max_rules_per_user >= 1 && floor(var.max_rules_per_user) == var.max_rules_per_user
    error_message = "max_rules_per_user deve ser um inteiro maior ou igual a 1."
  }
}

variable "tags" {
  description = "Tags aplicadas aos recursos."
  type        = map(string)
  default     = {}
}

variable "admin_group_name" {
  description = "Grupo do Cognito que identifica administradores."
  type        = string
}

variable "user_group_name" {
  description = "Grupo do Cognito dos usuários comuns."
  type        = string
}
