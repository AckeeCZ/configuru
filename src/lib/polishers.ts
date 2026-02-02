import { anonymize, traverseObject } from './helpers'
import { LoadedValue } from './loader'

type LoadedToValue<X> = X extends LoadedValue<any, any>
  ? X['value'] extends Record<any, any>
    ? Values<X['value']>
    : X['value']
  : X

export type Values<C> = C extends (...args: any[]) => any
  ? C
  : C extends Record<any, any>
  ? {
      [K in keyof C]: C[K] extends LoadedValue<any, any>
        ? LoadedToValue<C[K]>
        : Values<C[K]>
    }
  : C

export type AnonymousValues<C> = C extends (...args: any[]) => any
  ? C
  : C extends Record<any, any>
  ? {
      [K in keyof C]: C[K] extends LoadedValue<any, any>
        ? string
        : AnonymousValues<C[K]>
    }
  : C

const isLoadedValue = (x: any): x is LoadedValue<any, any, any> => {
  const keys = Object.keys(x ?? {})
  return keys.includes('__CONFIGURU_LEAF_LOADED')
}

const mapLoadedConfig = traverseObject(isLoadedValue)

const values = mapLoadedConfig(x => x.value) as <T extends Record<any, any>>(
  config: T
) => Values<T>

const maskedValues = mapLoadedConfig(x =>
  x.hidden ? anonymize(x.rawValue) : x.value
) as <T extends Record<any, any>>(config: T) => AnonymousValues<T>

export const createPolishFunctions = <T extends Record<any, any>>(
  config: T
) => ({
  values: () => values(config),
  maskedValues: () => maskedValues(config),
})
