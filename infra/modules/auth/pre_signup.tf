module "pre_signup_function" {
  count  = var.lambda_zip_path != "" ? 1 : 0
  source = "../lambda_function"

  name                    = "${var.name_prefix}-pre-signup"
  handler                 = "index.preSignUpHandler"
  zip_path                = var.lambda_zip_path
  memory_mb               = 256
  log_retention_days      = 14
  permissions_policy_json = data.aws_iam_policy_document.pre_signup.json
  tags                    = var.tags
}

data "aws_iam_policy_document" "pre_signup" {
  statement {
    sid    = "CognitoLinkGoogleAccount"
    effect = "Allow"
    actions = [
      "cognito-idp:ListUsers",
      "cognito-idp:AdminLinkProviderForUser",
    ]
    resources = [
      aws_cognito_user_pool.users.arn
    ]
  }
}

resource "aws_lambda_permission" "cognito_pre_signup" {
  count         = var.lambda_zip_path != "" ? 1 : 0
  statement_id  = "AllowCognitoInvokePreSignUp"
  action        = "lambda:InvokeFunction"
  function_name = module.pre_signup_function[0].function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.users.arn
}
