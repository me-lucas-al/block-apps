output "api_url" {
  description = "URL base da API."
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "lambda_function_name" {
  description = "Nome da função Lambda da API."
  value       = aws_lambda_function.api.function_name
}
