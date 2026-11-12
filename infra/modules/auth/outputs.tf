output "user_pool_id" {
  description = "ID do user pool do Cognito."
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  description = "ARN do user pool do Cognito."
  value       = aws_cognito_user_pool.main.arn
}

output "issuer_url" {
  description = "Issuer dos tokens, usado pelo authorizer JWT."
  value       = "https://${aws_cognito_user_pool.main.endpoint}"
}

output "web_client_id" {
  description = "Client do painel administrativo."
  value       = aws_cognito_user_pool_client.web.id
}

output "device_client_id" {
  description = "Client do app e da extensão."
  value       = aws_cognito_user_pool_client.device.id
}

output "client_ids" {
  description = "Todos os clients aceitos pela API."
  value       = [aws_cognito_user_pool_client.web.id, aws_cognito_user_pool_client.device.id]
}

output "hosted_login_domain" {
  description = "Domínio de login hospedado (Google)."
  value       = "${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.region}.amazoncognito.com"
}

output "initial_admin_temporary_password" {
  description = "Senha temporária do primeiro administrador (trocada no primeiro acesso)."
  value       = try(random_password.initial_admin[0].result, null)
  sensitive   = true
}
