output "api_url" {
  description = "URL base da API."
  value       = module.api.api_url
}

output "user_pool_id" {
  description = "ID do user pool do Cognito."
  value       = module.auth.user_pool_id
}

output "admin_web_client_id" {
  description = "Client do painel administrativo."
  value       = module.auth.admin_web_client_id
}

output "device_client_id" {
  description = "Client do app e da extensão."
  value       = module.auth.device_client_id
}

output "hosted_login_domain" {
  description = "Domínio do login hospedado (Google)."
  value       = module.auth.hosted_login_domain
}

output "admin_site_url" {
  description = "URL HTTPS pública do painel via CloudFront."
  value       = module.admin_site.site_url
}

output "admin_site_distribution_id" {
  description = "ID da distribuição CloudFront do painel para invalidações de cache."
  value       = module.admin_site.distribution_id
}

output "admin_site_bucket_name" {
  description = "Bucket S3 que guarda os arquivos do painel."
  value       = module.admin_site.bucket_name
output "data_reader_role_arn" {
  description = "Role somente leitura da tabela; assuma com MFA para ver os dados no Console."
  value       = module.data.reader_role_arn
}
