output "table_name" {
  description = "Nome da tabela DynamoDB."
  value       = aws_dynamodb_table.single_table.name
}

output "table_arn" {
  description = "ARN da tabela DynamoDB."
  value       = aws_dynamodb_table.single_table.arn
}

output "due_changes_index_name" {
  description = "Nome do índice das mudanças pendentes."
  value       = local.due_changes_index_name
}

output "due_changes_index_arn" {
  description = "ARN do índice das mudanças pendentes."
  value       = "${aws_dynamodb_table.single_table.arn}/index/${local.due_changes_index_name}"
}
