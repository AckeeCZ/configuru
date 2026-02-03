import { parseBool } from './helpers'

export type TransformFn<T> = (x: any) => T

export type ValueDefinition<T> = {
  key?: string
  hidden?: boolean
  nullable?: boolean
  transform: TransformFn<T>
  isCustom?: boolean
  __CONFIGURU_LEAF: true
}

export type SchemaDef = {
  [key: string]: ValueDefinition<any> | SchemaDef
}

const register =
  <T, K extends string>(
    transform: TransformFn<T>,
    hidden: boolean,
    nullable: boolean,
    isCustom: boolean
  ) =>
  <S extends K>(key?: S): ValueDefinition<T> => {
    return {
      key,
      hidden,
      nullable,
      transform,
      isCustom,
      __CONFIGURU_LEAF: true,
    }
  }

export const createSchemaFn = <T>(transform: (x: any) => T, isCustom = false) =>
  Object.assign(register<T, string>(transform, false, false, isCustom), {
    hidden: Object.assign(
      register<T, string>(transform, true, false, isCustom),
      {
        nullable: register<T, string>(transform, true, true, isCustom),
      }
    ),
    nullable: Object.assign(
      register<T, string>(transform, false, true, isCustom),
      {
        hidden: register<T, string>(transform, true, true, isCustom),
      }
    ),
  })

export const schema = {
  number: createSchemaFn(Number, false),
  string: createSchemaFn(String, false),
  bool: createSchemaFn(parseBool, false),
  json: createSchemaFn(JSON.parse, false),
  custom: <T>(fn: (x: any) => T) => createSchemaFn(fn, true),
}

export const isValueDefinition = (x: any): x is ValueDefinition<any> =>
  Object.keys(x ?? {}).includes('__CONFIGURU_LEAF')
