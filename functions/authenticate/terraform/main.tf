locals {
  project_id_map = {
    dev = "spotify-application-356414"
  }
}

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.34.0"
    }
  }
}

provider "google" {
  credentials = file("../../../credentials/gcp/${var.env}.json")
  project = local.project_id_map[var.env]
  region  = "us-central1"
}

module "authenticate" {
  source        = "../../../terraform/modules/gcp-functions/http"
  function_name = "authenticate"
  env           = var.env
  project_id    = local.project_id_map[var.env]
  region        = "us-central1"
  env_vars = {
    AUTHENTICATE_TOKEN: var.token_encryption_secret
  }
}
