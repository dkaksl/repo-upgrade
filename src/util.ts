import fetch from 'node-fetch'
import { readFileSync, writeFileSync } from 'fs'

import { debuglog } from 'util'
const trace = debuglog('trace')

type KvMap = { [key: string]: string }

interface PackageJson {
  script: KvMap
  prettier?: KvMap
  commitlint?: KvMap
  dependencies?: KvMap
  devDependencies?: KvMap
  jest?: KvMap
}

const shouldBeDevDependecies = [
  '@commitlint/cli',
  '@commitlint/config-conventional',
  'husky',
  'jest',
  '@tsconfig/node16',
  '@types/jest',
  'typescript',
  'eslint'
]

export const upgradePackageJson = async (packageJsonPath: string) => {
  trace(`upgrading package.json file at: ${packageJsonPath}`)
  const parsed = JSON.parse(readFileSync(packageJsonPath).toString())
  const upgraded = await getUpgradedPackageJson(parsed)
  trace(JSON.stringify(upgraded))
  trace(`writing upgraded package.json file at: ${packageJsonPath}`)
  writeFileSync(packageJsonPath, JSON.stringify(upgraded, null, 2))
}

const getUpgradedPackageJson = async (parsedPackageJson: PackageJson) => {
  const { dependencies, devDependencies } = parsedPackageJson

  const newDependencies = JSON.parse(JSON.stringify(dependencies || {}))
  const newDevDependecies = devDependencies || {}

  if (dependencies) {
    for (const k of Object.keys(dependencies)) {
      if (shouldBeDevDependecies.includes(k)) {
        delete newDependencies[k]
        newDevDependecies[k] = `^${await getLatestPackageVersion(k)}`
      }
    }
  }

  return { dependencies: newDependencies, devDependencies: newDevDependecies }
}

const getLatestPackageVersion = async (packageName: string) => {
  trace(`fetching latest version number for package ${packageName}`)
  return fetch(`https://registry.npmjs.org/${packageName}/latest`).then((res) =>
    res.json().then((json) => {
      return json.version as string
    })
  )
}
