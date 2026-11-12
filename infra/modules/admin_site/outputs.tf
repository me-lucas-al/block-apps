output "bucket_name" {
  description = "Nome do bucket S3 onde os arquivos do painel são depositados."
  value       = aws_s3_bucket.site.bucket
}

output "distribution_id" {
  description = "ID da distribuição do CloudFront (usado para invalidação de cache)."
  value       = aws_cloudfront_distribution.site.id
}

output "distribution_domain_name" {
  description = "Domínio CloudFront do painel."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "site_url" {
  description = "URL HTTPS pública do painel via CloudFront."
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}
