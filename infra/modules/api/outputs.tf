output "api_url" {
  description = "URL base da API."
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "api_function_name" {
  description = "Nome da função Lambda das rotas comuns."
  value       = module.api_function.function_name
}

output "admin_function_name" {
  description = "Nome da função Lambda das rotas de administração."
  value       = module.admin_function.function_name
}
