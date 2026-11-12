output "function_name" {
  description = "Nome da função Lambda."
  value       = aws_lambda_function.function.function_name
}

output "invoke_arn" {
  description = "ARN de invocação usado pelo API Gateway."
  value       = aws_lambda_function.function.invoke_arn
}
