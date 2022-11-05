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

module "verify-email" {
  source        = "../../../terraform/modules/gcp-functions/http"
  function_name = "delivery_on-status-change"
  env           = var.env
  project_id    = local.project_id_map[var.env]
  region        = "us-central1"
  env_vars = {
    VERIFY_EMAIL_SECRET: var.token_encryption_secret
  }
}
