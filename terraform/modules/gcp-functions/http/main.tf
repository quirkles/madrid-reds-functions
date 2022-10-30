locals {
  timestamp     = formatdate("YYMMDDhhmmss", timestamp())
  env_vars = merge(var.env_vars, {
    GCP_PROJECT       = var.project_id
    GCP_REGION        = var.region
    GCP_FUNCTION_NAME = var.function_name
  })
}

resource "google_storage_bucket" "bucket" {
  name                        = "mr-${var.env}-verify-email-gcf-source" # Every bucket name must be globally unique
  location                    = "us-central1"
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "object" {
  name   = "function-source.zip"
  bucket = google_storage_bucket.bucket.name
  source = "../function.zip"
}

resource "google_cloudfunctions2_function" "function" {
  name        = "mr-${var.env}-verify-email"
  location    = var.region
  description = "handles-email-verification"
  build_config {
    runtime     = "nodejs16"
    entry_point = "main"
    source {
      storage_source {
        bucket = google_storage_bucket.bucket.name
        object = google_storage_bucket_object.object.name
      }
    }
  }

  service_config {
    max_instance_count = 1
    available_memory   = "256M"
    timeout_seconds    = 60
  }
}

resource "google_cloudfunctions2_function_iam_member" "member" {
  project = google_cloudfunctions2_function.function.project
  location = google_cloudfunctions2_function.function.location
  cloud_function = google_cloudfunctions2_function.function.name
  role = "roles/cloudfunctions.invoker"
  member = "allUsers"
}

output "function_uri" {
  value = google_cloudfunctions2_function.function.service_config[0].uri
}
