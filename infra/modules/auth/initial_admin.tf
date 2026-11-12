resource "aws_cognito_user" "initial_admin" {
  count        = var.initial_admin_email == "" ? 0 : 1
  user_pool_id = aws_cognito_user_pool.users.id
  username     = var.initial_admin_email

  desired_delivery_mediums = ["EMAIL"]

  attributes = {
    email          = var.initial_admin_email
    email_verified = "true"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_cognito_user_in_group" "initial_admin" {
  count        = var.initial_admin_email == "" ? 0 : 1
  user_pool_id = aws_cognito_user_pool.users.id
  group_name   = aws_cognito_user_group.admin.name
  username     = aws_cognito_user.initial_admin[0].username

  lifecycle {
    prevent_destroy = true
  }
}
