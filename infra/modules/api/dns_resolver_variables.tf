variable "dns_upstream_url" {
  description = "URL https do resolvedor DoH público para onde a Lambda dns encaminha as consultas liberadas. Vazio usa o padrão do backend (https://1.1.1.1/dns-query)."
  type        = string
  default     = "https://1.1.1.1/dns-query"

  validation {
    condition     = var.dns_upstream_url == "" || can(regex("^https://[^/@\\s]+(/\\S*)?$", var.dns_upstream_url))
    error_message = "dns_upstream_url deve ser uma URL https sem credenciais (https://host/caminho) ou vazio."
  }
}

variable "dns_timeout_seconds" {
  description = "Tempo máximo da Lambda dns. O upstream tem teto de 2 segundos, então 3 segundos cobrem leitura do banco e resposta."
  type        = number
  default     = 3

  validation {
    condition     = var.dns_timeout_seconds >= 1 && var.dns_timeout_seconds <= 10 && floor(var.dns_timeout_seconds) == var.dns_timeout_seconds
    error_message = "dns_timeout_seconds deve ser um inteiro entre 1 e 10."
  }
}

variable "dns_reserved_concurrent_executions" {
  description = "Concorrência reservada da Lambda dns, que isola a rota aberta do resto da conta. -1 não reserva nada; contas novas com limite baixo de concorrência não conseguem reservar."
  type        = number
  default     = -1

  validation {
    condition     = var.dns_reserved_concurrent_executions >= -1 && floor(var.dns_reserved_concurrent_executions) == var.dns_reserved_concurrent_executions
    error_message = "dns_reserved_concurrent_executions deve ser um inteiro maior ou igual a -1."
  }
}

variable "dns_throttling_rate_limit" {
  description = "Requisições por segundo das rotas GET e POST /dns-query/{token}, somadas por rota entre todos os usuários. Acima disso o API Gateway responde 429."
  type        = number
  default     = 500

  validation {
    condition     = var.dns_throttling_rate_limit >= 1
    error_message = "dns_throttling_rate_limit deve ser maior ou igual a 1."
  }
}

variable "dns_throttling_burst_limit" {
  description = "Rajada permitida nas rotas /dns-query/{token}. Uma tela abre dezenas de consultas de uma vez, então a rajada precisa ser folgada."
  type        = number
  default     = 1000

  validation {
    condition     = var.dns_throttling_burst_limit >= 1
    error_message = "dns_throttling_burst_limit deve ser maior ou igual a 1."
  }
}

variable "dns_client_error_alarm_threshold" {
  description = "Quantidade de respostas 4xx (somando GET e POST) em 5 minutos nas rotas /dns-query/{token} que dispara o alarme. O 429 de throttling entra nessa conta."
  type        = number
  default     = 500

  validation {
    condition     = var.dns_client_error_alarm_threshold >= 1
    error_message = "dns_client_error_alarm_threshold deve ser maior ou igual a 1."
  }
}
