module "api_function" {
  source = "../lambda_function"

  name                    = "${var.name_prefix}-api"
  handler                 = "index.apiHandler"
  zip_path                = var.lambda_zip_path
  memory_mb               = var.lambda_memory_mb
  log_retention_days      = var.log_retention_days
  permissions_policy_json = data.aws_iam_policy_document.api_function.json
  tags                    = var.tags

  environment = {
    TABLE_NAME         = var.table_name
    MAX_RULES_PER_USER = tostring(var.max_rules_per_user)
    DNS_HOST           = var.dns_host
  }
}

module "dns_function" {
  source = "../lambda_function"

  name                           = "${var.name_prefix}-dns"
  handler                        = "index.dnsHandler"
  zip_path                       = var.lambda_zip_path
  memory_mb                      = var.lambda_memory_mb
  timeout_seconds                = var.dns_timeout_seconds
  reserved_concurrent_executions = var.dns_reserved_concurrent_executions
  log_retention_days             = var.log_retention_days
  permissions_policy_json        = data.aws_iam_policy_document.dns_function.json
  tags                           = var.tags

  environment = {
    TABLE_NAME       = var.table_name
    DNS_UPSTREAM_URL = var.dns_upstream_url
    DNS_HOST         = var.dns_host
  }
}

module "admin_function" {
  source = "../lambda_function"

  name                    = "${var.name_prefix}-admin"
  handler                 = "index.adminHandler"
  zip_path                = var.lambda_zip_path
  memory_mb               = var.lambda_memory_mb
  log_retention_days      = var.log_retention_days
  permissions_policy_json = data.aws_iam_policy_document.admin_function.json
  tags                    = var.tags

  environment = {
    TABLE_NAME        = var.table_name
    USER_POOL_ID      = var.user_pool_id
    ADMIN_GROUP_NAME  = var.admin_group_name
    ADMIN_CLIENT_ID   = var.admin_client_id
    USER_GROUP_NAME   = var.user_group_name
    ADMIN_REQUIRE_MFA = var.admin_require_mfa ? "true" : "false"
  }
}

module "scheduler_function" {
  source = "../lambda_function"

  name                    = "${var.name_prefix}-scheduler"
  handler                 = "index.schedulerHandler"
  zip_path                = var.lambda_zip_path
  memory_mb               = 256
  log_retention_days      = var.log_retention_days
  permissions_policy_json = data.aws_iam_policy_document.scheduler_function.json
  tags                    = var.tags

  environment = {
    TABLE_NAME = var.table_name
  }
}
