variable "name_prefix" {
  description = "Prefixo dos recursos, por exemplo block-apps-dev."
  type        = string
}

variable "deletion_protection" {
  description = "Impede apagar a tabela por engano. Ligue em produção."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags aplicadas aos recursos."
  type        = map(string)
  default     = {}
}
