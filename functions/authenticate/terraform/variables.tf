variable "env" {
  type = string
  default = "dev"
}

variable "token_encryption_secret" {
  description = "Secret used to decrypt the token query param"
  type        = string
  sensitive   = true
}
