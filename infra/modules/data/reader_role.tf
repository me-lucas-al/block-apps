data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "reader_assume_role" {
  statement {
    sid     = "AccountUsersWithMfa"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }

    condition {
      test     = "Bool"
      variable = "aws:MultiFactorAuthPresent"
      values   = ["true"]
    }
  }
}

data "aws_iam_policy_document" "read_table" {
  statement {
    sid    = "ReadTableItems"
    effect = "Allow"
    actions = [
      "dynamodb:BatchGetItem",
      "dynamodb:DescribeTable",
      "dynamodb:GetItem",
      "dynamodb:Query",
      "dynamodb:Scan",
    ]
    resources = [
      aws_dynamodb_table.single_table.arn,
      "${aws_dynamodb_table.single_table.arn}/index/*",
    ]
  }

  statement {
    sid       = "ListTablesInConsole"
    effect    = "Allow"
    actions   = ["dynamodb:ListTables"]
    resources = ["*"]
  }
}

resource "aws_iam_role" "data_reader" {
  name               = "${var.name_prefix}-data-reader"
  assume_role_policy = data.aws_iam_policy_document.reader_assume_role.json
  tags               = var.tags
}

resource "aws_iam_role_policy" "read_table" {
  name   = "read-table"
  role   = aws_iam_role.data_reader.id
  policy = data.aws_iam_policy_document.read_table.json
}
