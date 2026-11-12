terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

variable "aws_region" {
  description = "Região da AWS."
  type        = string
  default     = "sa-east-1"
}

variable "state_bucket_name" {
  description = "Nome único do bucket S3 que guarda o estado do Terraform."
  type        = string
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "block-apps"
      ManagedBy = "terraform"
    }
  }
}

resource "aws_s3_bucket" "state" {
  bucket = var.state_bucket_name
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "state_bucket_name" {
  description = "Use este nome no backend.hcl do ambiente."
  value       = aws_s3_bucket.state.id
}
