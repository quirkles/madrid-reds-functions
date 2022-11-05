(
  cd ../functions && find . -type f -name "secrets.*.enc" | sed  -r "s|secrets\.([a-z]+)\.ts\.enc|secrets.\1|g" | xargs -I % sh -c "gcloud kms decrypt --key=secrets-enc-key --keyring=madrid-reds --location=global --plaintext-file=%.ts --ciphertext-file=%.ts.enc"
)
