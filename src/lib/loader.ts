import { traverseObject, anonymize, isObject } from './helpers'
import { createPolishFunctions, Values, AnonymousValues } from './polishers'
import { isValueDefinition, SchemaDef, ValueDefinition } from './schema'
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
  R = N extends false ? T : T | null
> {
  key?: string
  rawValue: any
  value: R
  hidden: boolean
  nullable: boolean
  __CONFIGURU_LEAF_LOADED: true
}

type TransformSchemaDef<T> = T extends ValueDefinition<infer V>
  ? LoadedValue<V, T['nullable'] extends true ? true : false>
  : T extends Array<infer U>
  ? Array<TransformSchemaDef<U>>
  : T extends Record<string, any>
  ? T extends ValueDefinition<any>
    ? T
    : {
        [K in keyof T]: TransformSchemaDef<T[K]>
      }
  : T

const mapSchemaDef = traverseObject(isValueDefinition)

type LoaderResult<S extends SchemaDef> = {
  values: () => Values<TransformSchemaDef<S>>
  maskedValues: () => AnonymousValues<TransformSchemaDef<S>>
}

type LoaderFn = <S extends SchemaDef>(schema: S) => LoaderResult<S>

const createLoadFn =
  (opts: ConfigLoaderOptions): LoaderFn =>
  <S extends SchemaDef>(schema: S) => {
    const storage = createConfigStorage(opts)

    // Helper function to load a single value definition
    const loadValueDefinition = (
      def: ValueDefinition<any>,
      configKey?: string
    ): LoadedValue<any, any> => {
      const key = def.key ?? configKey
      if (key === undefined) {
        throw new Error(
          `Missing key for value definition ${JSON.stringify(
            def
          )}. Your config schema needs to be an object { key: <schema definition> }`
        )
      }
      const value = storage[key]

      const safeTransform = (x: any) => {
        try {
          return def.transform(x)
        } catch (_error) {
          const failedValue = def.hidden ? anonymize(value) : String(value)
          throw new Error(
            `Failed to transform value >${failedValue}< from key >${key}<`
          )
        }
      }

      const missing = value === undefined || value === null
      if (!def.nullable && missing) {
        throw new Error(`Missing required value ${key}`)
      }

      const transformedValue = missing ? null : safeTransform(value)

      const processNestedSchemas = (val: any): any => {
        if (val === null || val === undefined || typeof val !== 'object') {
          return val
        }
        if (isValueDefinition(val)) {
          return loadValueDefinition(val).value
        }
        if (Array.isArray(val)) {
          return val.map(processNestedSchemas)
        }
        if (isObject(val)) {
          const result: Record<string, any> = {}
          for (const k of Object.keys(val)) {
            result[k] = processNestedSchemas(val[k])
          }
          return result
        }
        return val
      }

      const processedValue = def.isCustom
        ? processNestedSchemas(transformedValue)
        : transformedValue

      return {
        key,
        rawValue: value,
        nullable: def.nullable ?? false,
        hidden: def.hidden ?? false,
        value: processedValue as any,
        __CONFIGURU_LEAF_LOADED: true,
      }
    }

    const load = mapSchemaDef((def, configKey) =>
      loadValueDefinition(def, configKey)
    )

    const config: TransformSchemaDef<S> = load(schema)

    return {
      ...createPolishFunctions(config),
    }
  }

export const createLoader = (
  opts: ConfigLoaderOptions = defaultOpts
): LoaderFn => {
  opts = { ...defaultOpts, ...opts }
  return createLoadFn(opts)
}
