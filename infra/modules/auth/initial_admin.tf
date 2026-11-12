resource "random_password" "initial_admin" {
  count            = var.initial_admin_email == "" ? 0 : 1
  length           = 20
  special          = true
  override_special = "!@#$%^&*-_=+"
  min_lower        = 2
  min_upper        = 2
  min_numeric      = 2
}

resource "aws_cognito_user" "initial_admin" {
  count          = var.initial_admin_email == "" ? 0 : 1
  user_pool_id   = aws_cognito_user_pool.main.id
  username       = var.initial_admin_email
  message_action = "SUPPRESS"

  temporary_password = random_password.initial_admin[0].result

  attributes = {
    email          = var.initial_admin_email
    email_verified = "true"
  }
}

resource "aws_cognito_user_in_group" "initial_admin" {
  count        = var.initial_admin_email == "" ? 0 : 1
  user_pool_id = aws_cognito_user_pool.main.id
  group_name   = aws_cognito_user_group.admin.name
  username     = aws_cognito_user.initial_admin[0].username
}
