locals {
  google_enabled     = var.google_client_id != ""
  identity_providers = local.google_enabled ? ["COGNITO", "Google"] : ["COGNITO"]
}

resource "aws_cognito_identity_provider" "google" {
  count         = local.google_enabled ? 1 : 0
  user_pool_id  = aws_cognito_user_pool.users.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "openid email profile"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
  }

  attribute_mapping = {
    email          = "email"
    email_verified = "email_verified"
    username       = "sub"
  }
}

resource "aws_cognito_user_pool_client" "admin_web" {
  name         = "${var.name_prefix}-admin-web"
  user_pool_id = aws_cognito_user_pool.users.id

  generate_secret                      = false
  explicit_auth_flows                  = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  prevent_user_existence_errors        = "ENABLED"
  enable_token_revocation              = true
  supported_identity_providers         = ["COGNITO"]
  allowed_oauth_flows_user_pool_client = false
  read_attributes                      = ["email", "email_verified"]
  write_attributes                     = ["email"]

  access_token_validity  = 15
  id_token_validity      = 15
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  depends_on = [aws_cognito_identity_provider.google]
}

resource "aws_cognito_user_pool_client" "device" {
  name         = "${var.name_prefix}-device"
  user_pool_id = aws_cognito_user_pool.users.id

  generate_secret                      = false
  explicit_auth_flows                  = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  prevent_user_existence_errors        = "ENABLED"
  enable_token_revocation              = true
  supported_identity_providers         = local.identity_providers
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  callback_urls = length(concat(var.device_callback_urls, var.extension_ids)) > 0 ? concat(
    var.device_callback_urls,
    [for id in var.extension_ids : "https://${id}.chromiumapp.org/"]
  ) : ["blockapps://auth"]
  logout_urls = length(concat(var.device_logout_urls, var.extension_ids)) > 0 ? concat(
    var.device_logout_urls,
    [for id in var.extension_ids : "https://${id}.chromiumapp.org/logout"]
  ) : ["blockapps://logout"]
  read_attributes  = ["email", "email_verified"]
  write_attributes = ["email"]

  access_token_validity  = 15
  id_token_validity      = 15
  refresh_token_validity = 90

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  depends_on = [aws_cognito_identity_provider.google]
}
