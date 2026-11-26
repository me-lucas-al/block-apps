variable "name" {
  description = "Nome da função, por exemplo block-apps-dev-api."
  type        = string
}

variable "handler" {
  description = "Handler exportado pelo pacote, por exemplo index.apiHandler."
  type        = string
}

variable "zip_path" {
  description = "Caminho do pacote .zip, relativo à pasta onde o terraform roda."
  type        = string
}

variable "memory_mb" {
  description = "Memória da função. Mais memória também dá mais CPU e acelera a partida a frio."
  type        = number
  default     = 512
}

variable "timeout_seconds" {
  description = "Tempo máximo de execução."
  type        = number
  default     = 10
}

variable "reserved_concurrent_executions" {
  description = "Concorrência reservada da função. -1 não reserva nada (usa o pool da conta)."
  type        = number
  default     = -1

  validation {
    condition     = var.reserved_concurrent_executions >= -1 && floor(var.reserved_concurrent_executions) == var.reserved_concurrent_executions
    error_message = "reserved_concurrent_executions deve ser um inteiro maior ou igual a -1."
  }
}

variable "environment" {
  description = "Variáveis de ambiente da função."
  type        = map(string)
  default     = {}
}

variable "permissions_policy_json" {
  description = "Política IAM (JSON) com as permissões desta função além dos logs."
  type        = string
}

variable "log_retention_days" {
  description = "Dias de retenção dos logs."
  type        = number
  default     = 30
}

variable "tags" {
  description = "Tags aplicadas aos recursos."
  type        = map(string)
  default     = {}
}
