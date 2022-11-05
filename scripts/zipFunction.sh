(
  cd "./functions/$1" || exit
  zip function.zip fn.js package.json
)
