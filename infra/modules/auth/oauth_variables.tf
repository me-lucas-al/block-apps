variable "lambda_zip_path" {
  description = "Caminho do pacote .zip com os handlers da Lambda (usado para o gatilho PreSignUp)."
  type        = string
  default     = ""
}

variable "device_callback_urls" {
  description = "URLs de retorno do OAuth para o app mobile (ex.: blockapps://auth)."
  type        = list(string)
  default     = ["blockapps://auth"]
}

variable "device_logout_urls" {
  description = "URLs de logout do OAuth para o app mobile (ex.: blockapps://logout)."
  type        = list(string)
  default     = ["blockapps://logout"]
}

variable "extension_ids" {
  description = "IDs das extensões do Chrome autorizadas no OAuth (gera https://<id>.chromiumapp.org/)."
  type        = list(string)
  default     = []
}
