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
    TABLE_NAME = var.table_name
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
    TABLE_NAME       = var.table_name
    USER_POOL_ID     = var.user_pool_id
    ADMIN_GROUP_NAME = var.admin_group_name
    USER_GROUP_NAME  = var.user_group_name
  }
}
