resource "aws_dynamodb_table" "single_table" {
  name                        = "${var.name_prefix}-data"
  billing_mode                = "PAY_PER_REQUEST"
  hash_key                    = "pk"
  range_key                   = "sk"
  deletion_protection_enabled = var.deletion_protection

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "dueBucket"
    type = "S"
  }

  attribute {
    name = "effectiveAt"
    type = "S"
  }

  global_secondary_index {
    name            = local.due_changes_index_name
    projection_type = "ALL"

    key_schema {
      attribute_name = "dueBucket"
      key_type       = "HASH"
    }

    key_schema {
      attribute_name = "effectiveAt"
      key_type       = "RANGE"
    }
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = var.tags

  lifecycle {
    prevent_destroy = true
  }
}

locals {
  due_changes_index_name = "due-changes"
}
