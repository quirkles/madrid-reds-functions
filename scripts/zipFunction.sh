(
  cd "./functions/$1" || exit
  zip function.zip main.js package.json
)
