output "user_pool_id" {
  description = "ID do user pool do Cognito."
  value       = aws_cognito_user_pool.users.id
}

output "user_pool_arn" {
  description = "ARN do user pool do Cognito."
  value       = aws_cognito_user_pool.users.arn
}

output "issuer_url" {
  description = "Issuer dos tokens, usado pelo authorizer JWT."
  value       = "https://${aws_cognito_user_pool.users.endpoint}"
}

output "admin_group_name" {
  description = "Grupo que identifica administradores."
  value       = aws_cognito_user_group.admin.name
}

output "user_group_name" {
  description = "Grupo dos usuários comuns."
  value       = aws_cognito_user_group.user.name
}

output "admin_web_client_id" {
  description = "Client do painel administrativo."
  value       = aws_cognito_user_pool_client.admin_web.id
}

output "device_client_id" {
  description = "Client do app e da extensão."
  value       = aws_cognito_user_pool_client.device.id
}

output "client_ids" {
  description = "Todos os clients aceitos pela API."
  value       = [aws_cognito_user_pool_client.admin_web.id, aws_cognito_user_pool_client.device.id]
}

output "hosted_login_domain" {
  description = "Domínio de login hospedado (Google)."
  value       = "${aws_cognito_user_pool_domain.hosted_login.domain}.auth.${data.aws_region.current.region}.amazoncognito.com"
}
