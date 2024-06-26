import { anonymize, isObject } from './helpers'
import { LoadedValue } from './loader'

type LoadedToValue<X> = X extends LoadedValue<any, any>
  ? X['value'] extends Record<any, any>
    ? Values<X['value']>
    : X['value']
  : X

type Values<C> = C extends (...args: any[]) => any
  ? C
  : C extends Record<any, any>
  ? {
      [K in keyof C]: C[K] extends LoadedValue<any, any>
        ? LoadedToValue<C[K]>
        : Values<C[K]>
    }
  : C

type AnonymousValues<C> = C extends (...args: any[]) => any
  ? C
  : C extends Record<any, any>
  ? {
      [K in keyof C]: C[K] extends LoadedValue<any, any>
        ? string
        : AnonymousValues<C[K]>
    }
  : C

const isLoadedValue = (x: any) =>
  Object.keys(x || {}).includes('__CONFIGURU_LEAF')

const mapConfig =
  (fn: (v: LoadedValue<any, any>) => any) =>
  (val: any): any => {
    if (isLoadedValue(val)) {
      return mapConfig(fn)(fn(val))
    }
    if (Array.isArray(val)) {
      return val.map(mapConfig(fn))
    }
    if (isObject(val)) {
      return Object.keys(val).reduce((res: any, key) => {
        res[key] = mapConfig(fn)(val[key])
        return res
      }, {})
    }
    return val
  }

export const values = mapConfig(x => x.value) as <T extends Record<any, any>>(
  config: T
) => Values<T>
export const maskedValues = mapConfig(x =>
  x.hidden ? anonymize(x.rawValue) : x.value
) as <T extends Record<any, any>>(config: T) => AnonymousValues<T>
