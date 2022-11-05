(
  cd ../functions && find . -type f -name "secrets.*.ts" | sed  -r "s|secrets\.([a-z]+)\.ts|secrets.\1|g" | xargs -I % sh -c "gcloud kms encrypt --key=secrets-enc-key --keyring=madrid-reds --location=global --plaintext-file=%.ts --ciphertext-file=%.ts.enc"
)
