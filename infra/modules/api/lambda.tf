resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.name_prefix}-api"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

resource "aws_lambda_function" "api" {
  function_name    = "${var.name_prefix}-api"
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs24.x"
  architectures    = ["arm64"]
  handler          = "lambda.handler"
  memory_size      = var.lambda_memory_mb
  timeout          = 10
  filename         = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path)

  environment {
    variables = {
      TABLE_NAME       = var.table_name
      USER_POOL_ID     = var.user_pool_id
      ADMIN_GROUP_NAME = "admin"
      NODE_OPTIONS     = "--enable-source-maps"
    }
  }

  logging_config {
    log_format = "JSON"
    log_group  = aws_cloudwatch_log_group.lambda.name
  }

  tags = var.tags

  depends_on = [aws_iam_role_policy_attachment.lambda_logs]
}
