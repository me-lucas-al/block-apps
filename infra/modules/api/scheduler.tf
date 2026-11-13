resource "aws_scheduler_schedule" "apply_due_changes" {
  name       = "${var.name_prefix}-apply-due-changes"
  group_name = "default"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression = "rate(5 minutes)"

  target {
    arn      = module.scheduler_function.function_arn
    role_arn = aws_iam_role.scheduler_invoke.arn

    retry_policy {
      maximum_retry_attempts = 0
    }
  }
}

resource "aws_lambda_function_event_invoke_config" "scheduler" {
  function_name          = module.scheduler_function.function_name
  maximum_retry_attempts = 0
}

resource "aws_iam_role" "scheduler_invoke" {
  name = "${var.name_prefix}-scheduler-invoke"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "scheduler.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "scheduler_invoke" {
  name = "${var.name_prefix}-scheduler-invoke-policy"
  role = aws_iam_role.scheduler_invoke.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "lambda:InvokeFunction"
        Resource = module.scheduler_function.function_arn
      }
    ]
  })
}
