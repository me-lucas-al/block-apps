resource "aws_cognito_user_pool" "users" {
  name                     = "${var.name_prefix}-users"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  mfa_configuration        = "OPTIONAL"
  deletion_protection      = var.deletion_protection ? "ACTIVE" : "INACTIVE"

  username_configuration {
    case_sensitive = false
  }

  password_policy {
    minimum_length                   = 10
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = false
    temporary_password_validity_days = 3
  }

  software_token_mfa_configuration {
    enabled = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  admin_create_user_config {
    allow_admin_create_user_only = !var.allow_self_signup
  }

  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  dynamic "email_configuration" {
    for_each = var.ses_identity_arn == "" ? [] : [1]

    content {
      email_sending_account = "DEVELOPER"
      source_arn            = var.ses_identity_arn
      from_email_address    = var.ses_from_address
    }
  }

  dynamic "lambda_config" {
    for_each = var.lambda_zip_path != "" ? [module.pre_signup_function[0].function_arn] : []

    content {
      pre_sign_up = lambda_config.value
    }
  }

  tags = var.tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.users.id
  description  = "Administradores: gerenciam os usuários comuns."
  precedence   = 1
}

resource "aws_cognito_user_group" "user" {
  name         = "user"
  user_pool_id = aws_cognito_user_pool.users.id
  description  = "Usuários comuns."
  precedence   = 10
}

resource "aws_cognito_user_pool_domain" "hosted_login" {
  domain       = var.hosted_domain_prefix
  user_pool_id = aws_cognito_user_pool.users.id
}
