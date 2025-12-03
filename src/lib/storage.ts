import { readFileSync, statSync } from 'fs'
import path from 'path'
import { JSONC } from './helpers'
import { ConfigLoaderOptions } from './loader'

const fileExistsSync = (path: string) => {
  try {
    return statSync(path).isFile()
  } catch (_error) {
    return false
  }
}
const fromPairs = (pairs: Array<[keyof any, any]>) =>
  Object.assign({}, ...Array.from(pairs, ([k, v]) => ({ [k]: v })))
const uniq = <T>(xs: T[]) => Array.from(new Set(xs))
const { keys } = Object

const loadInline = (secrets: string) => {
  try {
    return JSONC.parse(secrets)
  } catch {
    throw new Error('Invalid inline secrets')
  }
}

const loadFile = (filePath?: string) => {
  if (!filePath) {
    return {}
  }
  const absoluteFilePath = path.resolve(filePath)
  const { dir, name } = path.parse(absoluteFilePath)
  const testPaths = uniq([
    absoluteFilePath,
    path.format({ dir, name, ext: '.json' }),
    path.format({ dir, name, ext: '.jsonc' }),
  ])
  const resolvedPath = testPaths.find(fileExistsSync)
  if (!resolvedPath) {
    throw new Error(
      `File path set, but none of the following tested derivations exist:\n${testPaths.join(
        '\n'
      )}`
    )
  }
  try {
    return JSONC.parse(readFileSync(resolvedPath, 'utf-8'))
  } catch (_error) {
    throw new Error(`Invalid config file in ${resolvedPath}`)
  }
}

const isInlineSecret = (
  secretsOrFilename?: string
): secretsOrFilename is string => {
  return secretsOrFilename?.trim().startsWith('{') ?? false
}

const loadSecrets = (secretsOrPath?: string) => {
  if (isInlineSecret(secretsOrPath)) {
    return loadInline(secretsOrPath)
  }
  return loadFile(secretsOrPath)
}

export const createConfigStorage = (
  opts: Pick<
    ConfigLoaderOptions,
    'defaultConfigPath' | 'userConfigPath' | 'envMode'
  >
): Record<any, any> => {
  const defaultConfig = loadSecrets(opts.defaultConfigPath)
  const userConfig = loadSecrets(opts.userConfigPath)
  let envConfig: any = {}
  if (opts.envMode === 'default' || opts.envMode === 'merged') {
    const configKeys = [
      ...keys(defaultConfig),
      ...(opts.envMode === 'merged' ? keys(userConfig) : []),
    ]
    envConfig = fromPairs(
      configKeys
        .map(k => [k, process.env[k]] as [string, any])
        .filter(x => x[1] !== undefined)
    )
  } else if (opts.envMode === 'all') {
    envConfig = process.env
  }
  return { ...defaultConfig, ...userConfig, ...envConfig }
}
