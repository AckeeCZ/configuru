import { parseBool } from './helpers'
import { createConfigStorage } from './storage'

export interface ConfigLoaderOptions {
  defaultConfigPath?: string
  userConfigPath?: string
  envMode?: 'all' | 'default' | 'merged' | 'none'
}

const defaultOpts: ConfigLoaderOptions = {
  defaultConfigPath: '.env',
  userConfigPath: process.env.CFG_JSON_PATH,
  envMode: 'default',
}

export interface LoadedValue<
  T,
  N extends boolean,
  K extends string,
  R = N extends false ? T : T | null
> {
  key: K
  rawValue: any
  value: R
  hidden: boolean
  nullable: boolean
  __CONFIGURU_LEAF: true
}

export const createAtomLoaderFactory = (storage: Record<any, any>) => {
  const load =
    <T, N extends boolean, K extends string>(
      transform: (x: any) => T,
      hidden: boolean,
      nullable: boolean
    ) =>
    <S extends K>(key: S): LoadedValue<T, N, S> => {
      const value = storage[key]
      const safeTransform = (x: any) => {
        try {
          return transform(x)
        } catch {
          throw new Error(
            `Failed to transform value >${String(value)}< from key >${key}<`
          )
        }
      }
      const missing = value === undefined || value === null
      if (!nullable && missing) {
        throw new Error(`Missing required value ${key}`)
      }
      return {
        key,
        hidden,
        nullable,
        rawValue: value,
        value: missing ? null : (safeTransform(value) as any),
        __CONFIGURU_LEAF: true,
      }
    }
  return <T>(transform: (x: any) => T) =>
    Object.assign(load<T, false, string>(transform, false, false), {
      hidden: Object.assign(load<T, false, string>(transform, true, false), {
        nullable: load<T, true, string>(transform, true, true),
      }),
      nullable: Object.assign(load<T, true, string>(transform, false, true), {
        hidden: load<T, true, string>(transform, true, true),
      }),
    })
}

export const createLoader = (opts: ConfigLoaderOptions = defaultOpts) => {
  opts = { ...defaultOpts, ...opts }
  const configStorage = createConfigStorage(opts)
  const atomLoader = createAtomLoaderFactory(configStorage)
  return {
    number: atomLoader(Number),
    string: atomLoader(String),
    bool: atomLoader(parseBool),
    json: atomLoader(JSON.parse),
    custom: <T>(fn: (x: any) => T) => atomLoader(fn),
  }
}
