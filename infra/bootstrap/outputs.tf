output "state_bucket_name" {
  description = "Use este nome no backend.hcl do ambiente."
  value       = aws_s3_bucket.state.id
}
