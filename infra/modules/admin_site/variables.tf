variable "name_prefix" {
  description = "Prefixo dos recursos, por exemplo block-apps-dev."
  type        = string
}

variable "aws_region" {
  description = "Região da AWS para compor o domínio do Cognito."
  type        = string
  default     = "sa-east-1"
}

variable "api_endpoint" {
  description = "Endpoint do API Gateway para a diretiva connect-src do CSP."
  type        = string
}

variable "hosted_domain_prefix" {
  description = "Prefixo do domínio hospedado do Cognito para a diretiva connect-src do CSP."
  type        = string
}

variable "tags" {
  description = "Tags aplicadas aos recursos."
  type        = map(string)
  default     = {}
}
