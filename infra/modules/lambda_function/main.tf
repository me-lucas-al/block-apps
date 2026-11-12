resource "aws_cloudwatch_log_group" "function" {
  name              = "/aws/lambda/${var.name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "logs_and_tracing" {
  statement {
    sid       = "WriteOwnLogs"
    effect    = "Allow"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.function.arn}:*"]
  }

  statement {
    sid       = "WriteTraces"
    effect    = "Allow"
    actions   = ["xray:PutTraceSegments", "xray:PutTelemetryRecords"]
    resources = ["*"]
  }
}

resource "aws_iam_role" "function" {
  name               = var.name
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  tags               = var.tags
}

resource "aws_iam_role_policy" "logs_and_tracing" {
  name   = "logs-and-tracing"
  role   = aws_iam_role.function.id
  policy = data.aws_iam_policy_document.logs_and_tracing.json
}

resource "aws_iam_role_policy" "permissions" {
  name   = "permissions"
  role   = aws_iam_role.function.id
  policy = var.permissions_policy_json
}

resource "aws_lambda_function" "function" {
  function_name    = var.name
  role             = aws_iam_role.function.arn
  runtime          = "nodejs24.x"
  architectures    = ["arm64"]
  handler          = var.handler
  memory_size      = var.memory_mb
  timeout          = var.timeout_seconds
  filename         = var.zip_path
  source_code_hash = try(filebase64sha256(var.zip_path), null)

  environment {
    variables = merge(var.environment, { NODE_OPTIONS = "--enable-source-maps" })
  }

  logging_config {
    log_format = "JSON"
    log_group  = aws_cloudwatch_log_group.function.name
  }

  tracing_config {
    mode = "Active"
  }

  tags = var.tags

  lifecycle {
    precondition {
      condition     = fileexists(var.zip_path)
      error_message = "O pacote ${var.zip_path} não existe. Gere com: pnpm --filter @block-apps/backend package"
    }
  }

  depends_on = [aws_iam_role_policy.logs_and_tracing]
}
