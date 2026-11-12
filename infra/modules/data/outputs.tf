output "table_name" {
  description = "Nome da tabela DynamoDB."
  value       = aws_dynamodb_table.main.name
}

output "table_arn" {
  description = "ARN da tabela DynamoDB."
  value       = aws_dynamodb_table.main.arn
}

output "due_changes_index_arn" {
  description = "ARN do índice das mudanças pendentes."
  value       = "${aws_dynamodb_table.main.arn}/index/due-changes"
}
