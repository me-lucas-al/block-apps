variable "aws_region" {
  description = "Região da AWS."
  type        = string
  default     = "sa-east-1"
}

variable "state_bucket_name" {
  description = "Nome único do bucket S3 que guarda o estado do Terraform."
  type        = string
}
