import * as jsonParser from 'jsonc-parser'

export const anonymize = (val: any) => (val === '' ? val : '[redacted]')

export const parseBool = (x: any) =>
  x === 'false' || x === '0' ? false : Boolean(x)
export const identity = <T>(x: T) => x

export const isObject = (x: any) =>
  typeof x === 'object' &&
  Object.prototype.toString.call(x) === '[object Object]'

export const JSONC = {
  parse: (text: string) => {
    const errors: jsonParser.ParseError[] = []
    const parsed = jsonParser.parse(text, errors)
    if (errors.length) {
      throw new SyntaxError(
        `${jsonParser.printParseErrorCode(errors[0].error)} at position ${
          errors[0].offset
        }`
      )
    }
    return parsed
  },
}

export const traverseObject =
  <Leaf>(isLeaf: (v: any) => v is Leaf) =>
  (fn: (v: Leaf, key?: string) => any) =>
  (val: any): any => {
    const mapSchemaValue = (value: any, key?: string): any => {
      if (isLeaf(value)) {
        const transformed = fn(value, key)
        return isLeaf(transformed)
          ? mapSchemaValue(transformed, key)
          : transformed
      }
      if (Array.isArray(value)) {
        // eslint-disable-next-line sonarjs/no-nested-functions
        return value.map((val, index) =>
          mapSchemaValue(val, key ? `${key}[${index}]` : undefined)
        )
      }
      if (isObject(value)) {
        const result: Record<string, any> = {}
        for (const key of Object.keys(value)) {
          result[key] = mapSchemaValue(value[key], key)
        }
        return result
      }
      return value
    }
    return { ...mapSchemaValue(val) }
  }
