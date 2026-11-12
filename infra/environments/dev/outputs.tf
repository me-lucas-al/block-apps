output "api_url" {
  description = "URL base da API."
  value       = module.api.api_url
}

output "user_pool_id" {
  description = "ID do user pool do Cognito."
  value       = module.auth.user_pool_id
}

output "web_client_id" {
  description = "Client do painel administrativo."
  value       = module.auth.web_client_id
}

output "device_client_id" {
  description = "Client do app e da extensão."
  value       = module.auth.device_client_id
}

output "hosted_login_domain" {
  description = "Domínio do login hospedado (Google)."
  value       = module.auth.hosted_login_domain
}

output "initial_admin_temporary_password" {
  description = "Senha temporária do primeiro administrador. Leia com: terraform output -raw initial_admin_temporary_password"
  value       = module.auth.initial_admin_temporary_password
  sensitive   = true
}
