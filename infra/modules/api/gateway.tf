resource "aws_cloudwatch_log_group" "gateway" {
  name              = "/aws/apigateway/${var.name_prefix}-api"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.name_prefix}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = var.allowed_origins
    allow_methods = ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["authorization", "content-type"]
    max_age       = 600
  }

  tags = var.tags
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  name             = "cognito-jwt"
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    issuer   = var.issuer_url
    audience = var.client_ids
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "health" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /health"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "NONE"
}

resource "aws_apigatewayv2_route" "protected" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "ANY /{proxy+}"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 50
    throttling_rate_limit  = 25
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.gateway.arn
    format = jsonencode({
      requestId = "$context.requestId"
      ip        = "$context.identity.sourceIp"
      route     = "$context.routeKey"
      status    = "$context.status"
      latencyMs = "$context.responseLatency"
    })
  }

  tags = var.tags
}

resource "aws_lambda_permission" "gateway_invokes_api" {
  statement_id  = "AllowHttpApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
