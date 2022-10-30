const fs = require('fs')
const path = require('path')
const readLine = require('readline')

const functionsDir = path.join(__dirname, '../functions')

let rootDeps = {}

async function getFunctionNames() {
  return new Promise((resolve, reject) => {
    fs.readdir(functionsDir, {withFileTypes: true}, (err, results) => {
      if (err) {
        return reject(err)
      }
      return resolve(results.reduce((functionNames, dirent) => {
        if (dirent.isDirectory()) {
          functionNames.push(dirent.name)
        }
        return functionNames
      }, []))
    })
  })
}

async function buildPackageJsonForFunction(functionName) {
  const entryPoint = path.join(functionsDir, functionName, 'main.js')
  if (!fs.existsSync(entryPoint)) {
    throw new Error(`Failed to find fn entry point at ${entryPoint} did you forget to build this function?`)
  }
  const externalDeps = await getExternalDepsFromFile(entryPoint)
  const json = {
    main: "main.js",
    dependencies: externalDeps.reduce((depMap, dep) => {
      if(rootDeps[dep]) {
        depMap[dep] = rootDeps[dep]
      } else {
        console.warn(`Found dependency: ${dep} in function: ${functionName} that is not listed in the root package json, without knowing the version to use it is not safe to add this to the dependency map. It is likely this function will fail if deployed.`)
      }
        return depMap
    }, {})
  }
  
  console.log(`Writing json to: ${path.join(functionsDir, functionName, 'package.json')}`)

  fs.writeFileSync(path.join(functionsDir, functionName, 'package.json'), JSON.stringify(json, null, 2))
}

const externalLibRegex = /^[\s]*![*]+[\s]*external[\s]*["'](?<lib>.*)['"][\s]+[*]*![\s]*$/
// Ideally we would scan the ts file and deal with branching/circular deps, and not rely on the webpack build looking a certain way
// However that is far more challenging, so here we are
async function getExternalDepsFromFile(file) {
  return new Promise((resolve, reject) => {
    const externals = []
    const rl = readLine.createInterface({
      input: fs.createReadStream(file).on('error', reject),
    });
    rl.on('line', (line) => {
      const execResult = externalLibRegex.exec(line.toString())
      if (execResult?.groups?.lib) {
        externals.push(execResult?.groups?.lib)
      }
    })
    rl.on('close', () => {
      return resolve(externals)
    })
  })
}

async function main(functionName) {
  const [_, __, ...argFunctionNames] = process.argv

  const existingFunctionNames = await getFunctionNames()

  let functionsToBuild

  if (argFunctionNames.length === 0) {
    console.log(`No function names passed, will attempt to generate package.json files for all functions:\n${existingFunctionNames.join('\n')}\n`)
    functionsToBuild = existingFunctionNames
  } else {
    const [existingArgFunctions, nonExistingArgFunctions] = argFunctionNames.reduce(
      ([existing, notExisting], argFunctionName) => {
        if (existingFunctionNames.includes(argFunctionName)) {
          existing.push(argFunctionName)
        } else {
          notExisting.push(argFunctionName)
        }
        return [existing, notExisting]
      },
      [[], []]
    )
    if (nonExistingArgFunctions.length) {
      console.warn(`Ignoring function name${nonExistingArgFunctions.length > 1 ? 's' : ''} that were not found in the function directory:\n${nonExistingArgFunctions.join('\n')}\n`)
    }
    if (!existingArgFunctions.length) {
      console.error('No valid function names were passed')
      throw new Error('Bad input')
    }
    console.log(`Attempting to generate package json file${existingArgFunctions.length > 1 ? 's' : ''} for function${existingArgFunctions.length > 1 ? 's' : ''}:\n${existingArgFunctions.join('\n')}\n`)
    functionsToBuild = existingArgFunctions
  }

  // we are going to take the versions installed in the root package json
  rootDeps = require(path.join(__dirname, '../package.json')).dependencies

  for (const fn of functionsToBuild) {
    console.log(`Begin build for function: ${fn}`)
    // ensure sequential building so that the logs make sense
    try {
      await buildPackageJsonForFunction(fn)
      console.log(`Finished function: ${fn}`)
    } catch (e) {
      console.error(`Failed to build fn: ${fn}: ${e.message}`)
    }
  }
}

main()
  .then(() => console.log('done'))
  .catch((error) => console.error(`Failed to generate package json: ${error.message}`))
