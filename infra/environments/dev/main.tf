locals {
  name_prefix = "block-apps-${var.environment_name}"

  tags = {
    Project     = "block-apps"
    Environment = var.environment_name
    ManagedBy   = "terraform"
  }
}

module "data" {
  source = "../../modules/data"

  name_prefix         = local.name_prefix
  deletion_protection = var.protect_from_deletion
}

module "auth" {
  source = "../../modules/auth"

  name_prefix          = local.name_prefix
  deletion_protection  = var.protect_from_deletion
  allow_self_signup    = var.allow_self_signup
  hosted_domain_prefix = var.hosted_domain_prefix
  web_callback_urls    = var.web_callback_urls
  web_logout_urls      = var.web_logout_urls
  google_client_id     = var.google_client_id
  google_client_secret = var.google_client_secret
  initial_admin_email  = var.initial_admin_email
}

module "api" {
  source = "../../modules/api"

  name_prefix           = local.name_prefix
  lambda_zip_path       = var.lambda_zip_path
  table_name            = module.data.table_name
  table_arn             = module.data.table_arn
  due_changes_index_arn = module.data.due_changes_index_arn
  user_pool_id          = module.auth.user_pool_id
  user_pool_arn         = module.auth.user_pool_arn
  admin_group_name      = module.auth.admin_group_name
  user_group_name       = module.auth.user_group_name
  issuer_url            = module.auth.issuer_url
  client_ids            = module.auth.client_ids
  allowed_origins       = var.allowed_origins
}
