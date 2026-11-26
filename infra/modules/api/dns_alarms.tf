locals {
  dns_metric_namespace = "BlockApps/Dns"

  dns_event_alarm_thresholds = {
    DnsFailOpen           = 0
    DnsTokenLookupFailure = 5
    DnsUpstreamFailure    = 50
  }

  dns_route_methods = {
    get  = "GET"
    post = "POST"
  }
}

resource "aws_cloudwatch_metric_alarm" "dns_route_client_errors" {
  alarm_name          = "${var.name_prefix}-dns-query-4xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = var.dns_client_error_alarm_threshold
  alarm_description   = "DNS query routes returned many 4xx responses in 5 minutes; throttling (429) is counted here"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]

  metric_query {
    id          = "total_client_errors"
    expression  = "get_4xx + post_4xx"
    label       = "DNS query 4xx"
    return_data = true
  }

  dynamic "metric_query" {
    for_each = local.dns_route_methods

    content {
      id = "${metric_query.key}_4xx"

      metric {
        metric_name = "4xx"
        namespace   = "AWS/ApiGateway"
        period      = 300
        stat        = "Sum"

        dimensions = {
          ApiId    = aws_apigatewayv2_api.main.id
          Stage    = aws_apigatewayv2_stage.default.name
          Method   = metric_query.value
          Resource = "/dns-query/{token}"
        }
      }
    }
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "dns_lambda_throttles" {
  alarm_name          = "${var.name_prefix}-dns-lambda-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "DNS resolver Lambda is being throttled by its concurrency limit"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]

  dimensions = {
    FunctionName = module.dns_function.function_name
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "dns_resolver_events" {
  for_each = local.dns_event_alarm_thresholds

  alarm_name          = "${var.name_prefix}-dns-${lower(each.key)}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = each.key
  namespace           = local.dns_metric_namespace
  period              = 300
  statistic           = "Sum"
  threshold           = each.value
  alarm_description   = "DNS resolver metric ${each.key} exceeded ${each.value} in 5 minutes (DnsFailOpen means blocking is being skipped because rules cannot be read)"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]

  tags = var.tags
}
