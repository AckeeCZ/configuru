import { anonymize, isObject, UnionToIntersection } from './helpers'
import { LoadedValue } from './loader'

type ValueType<T> = T extends LoadedValue<infer V, any, any> ? V : T

type SchemaValues<T> = T extends Record<any, any>
  ? {
      [K in keyof T]: T[K] extends LoadedValue<any, any, any>
        ? ValueType<T[K]>
        : SchemaValues<T[K]>
    }
  : T

type EnvVars<T> = T extends LoadedValue<infer V, any, infer K>
  ? { [P in K]: V }
  : T extends Record<any, any>
  ? UnionToIntersection<EnvVars<T[keyof T]>>
  : never

type Values<T> = T extends (...args: any[]) => any
  ? T
  : {
      [K in
        | keyof SchemaValues<T>
        | keyof EnvVars<T>]: K extends keyof SchemaValues<T>
        ? SchemaValues<T>[K]
        : K extends keyof EnvVars<T>
        ? EnvVars<T>[K]
        : never
    }

type AnonymousValues<T> = T extends (...args: any[]) => any
  ? T
  : {
      [K in keyof Values<T>]: Values<T>[K] extends string | number | boolean
        ? string
        : AnonymousValues<Values<T>[K]>
    }

const isLoadedValue = (x: any): x is LoadedValue<any, any, any> =>
  Object.keys(x ?? {}).includes('__CONFIGURU_LEAF')

const mapConfig =
  (fn: (v: LoadedValue<any, any, any>) => any) =>
  (val: any): any => {
    const rootEnvVars: Record<string, any> = {}

    const extractEnvVars = (value: any) => {
      if (isLoadedValue(value)) {
        rootEnvVars[value.key] = value.value
      } else if (Array.isArray(value)) {
        value.forEach(extractEnvVars)
      } else if (isObject(value)) {
        Object.values(value).forEach(extractEnvVars)
      }
    }

    const mapSchemaValue = (value: any): any => {
      if (isLoadedValue(value)) {
        const transformed = fn(value)
        return isLoadedValue(transformed)
          ? mapSchemaValue(transformed)
          : transformed
      }
      if (Array.isArray(value)) {
        return value.map(mapSchemaValue)
      }
      if (isObject(value)) {
        const result: Record<string, any> = {}
        for (const key of Object.keys(value)) {
          result[key] = mapSchemaValue(value[key])
        }
        return result
      }
      return value
    }

    extractEnvVars(val)
    return { ...mapSchemaValue(val), ...rootEnvVars }
  }

export const values = mapConfig(x => x.value) as <T extends Record<any, any>>(
  config: T
) => Values<T>

export const maskedValues = mapConfig(x =>
  x.hidden ? anonymize(x.rawValue) : x.value
) as <T extends Record<any, any>>(config: T) => AnonymousValues<T>
