variable "function_name" {
  type    = string
}

variable "project_id" { type = string }
variable "env" { type = string }
variable "region" { type = string }

variable "env_vars" {
  type    = map(string)
  default = {}
}

variable "invoker" {
  default = "allUsers"
}
