import { resolve } from 'path'
import { createAtomLoaderFactory, createLoader } from '../lib/loader'
import { values } from '../lib/polishers'

const config = {
  string: 'string',
  number: 42,
  boolean: false,
  null: null,
}

const stringLoader = createAtomLoaderFactory(config)(x => String(x))

describe('loader', () => {
  const { string, custom } = createLoader({
    defaultConfigPath: resolve(__dirname, './sandbox/loader.jsonc'),
  })
  const schema = {
    foo: string('FOO'),
    stamp: custom((foo: string) => `${foo}bar`)('FOO'),
    expanded: custom(x => {
      return x
        .split('')
        .map((letter: string) => ({ s: letter, foo: string('FOO') }))
    })('FOO'),
  }
  const { foo, stamp, expanded } = values(schema)
  expect(foo).toMatchInlineSnapshot('"foo"')
  expect(stamp).toMatchInlineSnapshot('"foobar"')
  expect(expanded).toMatchInlineSnapshot(`
    Array [
      Object {
        "foo": Object {
          "__CONFIGURU_LEAF": true,
          "hidden": false,
          "key": "FOO",
          "nullable": false,
          "rawValue": "foo",
          "value": "foo",
        },
        "s": "f",
      },
      Object {
        "foo": Object {
          "__CONFIGURU_LEAF": true,
          "hidden": false,
          "key": "FOO",
          "nullable": false,
          "rawValue": "foo",
          "value": "foo",
        },
        "s": "o",
      },
      Object {
        "foo": Object {
          "__CONFIGURU_LEAF": true,
          "hidden": false,
          "key": "FOO",
          "nullable": false,
          "rawValue": "foo",
          "value": "foo",
        },
        "s": "o",
      },
    ]
  `)
})

describe('Loader exposes env var names', () => {
  const { string, custom } = createLoader({
    defaultConfigPath: resolve(__dirname, './sandbox/loader.jsonc'),
  })
  const schema = {
    foo: string('FOO'),
    stamp: custom((foo: string) => `${foo}bar`)('STAMP'),
  }
  expect(values(schema)).toMatchInlineSnapshot(`
    Object {
      "FOO": "foo",
      "STAMP": "PHOTO-2019-04-01bar",
      "foo": "foo",
      "stamp": "PHOTO-2019-04-01bar",
    }
  `)
})

describe('Loader exposes env var names at root level', () => {
  const { string, custom } = createLoader({
    defaultConfigPath: resolve(__dirname, './sandbox/loader.jsonc'),
  })

  test('flat object', () => {
    const schema = {
      foo: string('FOO'),
      stamp: custom((foo: string) => `${foo}bar`)('STAMP'),
    }
    const config = values(schema)
    expect(config).toMatchInlineSnapshot(`
      Object {
        "FOO": "foo",
        "STAMP": "PHOTO-2019-04-01bar",
        "foo": "foo",
        "stamp": "PHOTO-2019-04-01bar",
      }
    `)
  })

  test('nested object', () => {
    const schema = {
      test: {
        k1: string('FOO'),
        deep: {
          k2: string('STAMP'),
        },
      },
    }
    const config = values(schema)
    expect(config).toMatchInlineSnapshot(`
      Object {
        "FOO": "foo",
        "STAMP": "PHOTO-2019-04-01",
        "test": Object {
          "deep": Object {
            "k2": "PHOTO-2019-04-01",
          },
          "k1": "foo",
        },
      }
    `)
  })
})

describe('atomLoader', () => {
  describe('string loader', () => {
    test('number', () => {
      expect(stringLoader('number')).toMatchInlineSnapshot(`
        Object {
          "__CONFIGURU_LEAF": true,
          "hidden": false,
          "key": "number",
          "nullable": false,
          "rawValue": 42,
          "value": "42",
        }
      `)
    })
    test('nullable', () => {
      // empty throws on default
      expect(() => stringLoader('null')).toThrow(/missing/i)
      expect(() => stringLoader('undefined')).toThrow(/missing/i)
      // empty valid on nullable
      expect(stringLoader.nullable('null')).toMatchInlineSnapshot(`
        Object {
          "__CONFIGURU_LEAF": true,
          "hidden": false,
          "key": "null",
          "nullable": true,
          "rawValue": null,
          "value": null,
        }
      `)
      expect(stringLoader.nullable('undefined')).toMatchInlineSnapshot(`
        Object {
          "__CONFIGURU_LEAF": true,
          "hidden": false,
          "key": "undefined",
          "nullable": true,
          "rawValue": undefined,
          "value": null,
        }
      `)
    })
    test('nullable & hidden', () => {
      // empty throws on hidden
      expect(() => stringLoader.hidden('null')).toThrow(/missing/i)
      expect(() => stringLoader.hidden('undefined')).toThrow(/missing/i)
      // empty valid on nullable
      expect(stringLoader.hidden.nullable('null')).toMatchInlineSnapshot(`
        Object {
          "__CONFIGURU_LEAF": true,
          "hidden": true,
          "key": "null",
          "nullable": true,
          "rawValue": null,
          "value": null,
        }
      `)
      expect(stringLoader.hidden.nullable('undefined')).toMatchInlineSnapshot(`
        Object {
          "__CONFIGURU_LEAF": true,
          "hidden": true,
          "key": "undefined",
          "nullable": true,
          "rawValue": undefined,
          "value": null,
        }
      `)
    })
    test('hidden', () => {
      expect(stringLoader.hidden('string')).toMatchInlineSnapshot(`
        Object {
          "__CONFIGURU_LEAF": true,
          "hidden": true,
          "key": "string",
          "nullable": false,
          "rawValue": "string",
          "value": "string",
        }
      `)
    })
  })
})
