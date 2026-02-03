import { resolve } from 'path'
import { createLoader } from '../lib/loader'
import { schema, SchemaDef } from '../lib/schema'

const loaderJsonPath = './sandbox/loader.jsonc'
const baseConfig = './sandbox/base.jsonc'

describe('loader', () => {
  const loadConfig = createLoader({
    defaultConfigPath: resolve(__dirname, loaderJsonPath),
  })
  const config = loadConfig({
    foo: schema.string('FOO'),
    stamp: schema.custom((foo: string) => `${foo}bar`)('FOO'),
    expanded: schema.custom(x => {
      return x.split('').map((letter: string) => ({
        s: letter,
        foo: schema.string('FOO'),
      }))
    })('FOO'),
  }).values()
  const { foo, stamp, expanded } = config
  expect(foo).toMatchInlineSnapshot('"foo"')
  expect(stamp).toMatchInlineSnapshot('"foobar"')
  expect(expanded).toMatchInlineSnapshot(`
    Array [
      Object {
        "foo": "foo",
        "s": "f",
      },
      Object {
        "foo": "foo",
        "s": "o",
      },
      Object {
        "foo": "foo",
        "s": "o",
      },
    ]
  `)
})

describe('Loader exposes env var names', () => {
  const loader = createLoader({
    defaultConfigPath: resolve(__dirname, loaderJsonPath),
  })
  const config = loader({
    foo: schema.string('FOO'),
    stamp: schema.custom((foo: string) => `${foo}bar`)('STAMP'),
  }).values()

  expect(config).toMatchInlineSnapshot(`
    Object {
      "foo": "foo",
      "stamp": "PHOTO-2019-04-01bar",
    }
  `)
})

describe('simple loads', () => {
  const loader = createLoader({
    defaultConfigPath: resolve(__dirname, baseConfig),
  })

  const load = <T extends SchemaDef>(schema: T) => loader(schema).maskedValues()

  describe('string loader', () => {
    test('number', () => {
      expect(schema.number('number')).toMatchInlineSnapshot(`
        Object {
          "__CONFIGURU_LEAF": true,
          "hidden": false,
          "isCustom": false,
          "key": "number",
          "nullable": false,
          "transform": [Function],
        }
      `)
    })
    test('nullable', () => {
      // empty throws on default
      expect(() => load({ null: schema.string() })).toThrow(/missing/i)
      expect(() => load({ undefined: schema.string() })).toThrow(/missing/i)
      // empty valid on nullable
      expect(load({ null: schema.string.nullable() })).toMatchInlineSnapshot(`
        Object {
          "null": null,
        }
      `)
      expect(load({ undefined: schema.string.nullable() }))
        .toMatchInlineSnapshot(`
        Object {
          "undefined": null,
        }
      `)
    })
    test('nullable & hidden', () => {
      // empty throws on hidden
      expect(() => load({ null: schema.string.hidden() })).toThrow(/missing/i)
      expect(() => load({ undefined: schema.string.hidden() })).toThrow(
        /missing/i
      )
      // empty valid on nullable
      expect(load({ null: schema.string.hidden.nullable() }))
        .toMatchInlineSnapshot(`
        Object {
          "null": "[redacted]",
        }
      `)
      expect(load({ undefined: schema.string.hidden.nullable() }))
        .toMatchInlineSnapshot(`
        Object {
          "undefined": "[redacted]",
        }
      `)
    })
    test('hidden', () => {
      expect(load({ string: schema.string.hidden() })).toMatchInlineSnapshot(`
        Object {
          "string": "[redacted]",
        }
      `)
    })
  })
  describe('reload', () => {
    let oldString: string | undefined
    beforeAll(() => {
      oldString = process.env.string
    })
    afterEach(() => {
      if (oldString) {
        process.env.string = oldString
      } else {
        delete process.env.string
      }
    })
    test('reload', () => {
      const config = loader({ string: schema.string.hidden() })
      process.env.string = 'string_changed'

      expect(config.values()).toMatchInlineSnapshot(`
        Object {
          "string": "string",
        }
      `)

      expect(config.reload().values()).toMatchInlineSnapshot(`
        Object {
          "string": "string_changed",
        }
      `)
      expect(config.reload().maskedValues()).toMatchInlineSnapshot(`
        Object {
          "string": "[redacted]",
        }
      `)
    })
  })
})
