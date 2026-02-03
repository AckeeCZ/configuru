## Advanced usage

### Constant parameters

Sometimes it makes sense to have a static parameter in configuration. For example, when connecting to third party service, you want to have api key configurable per environment, but connection options not. You can insert in your configuration schema constant values of any type without loader and use Configuru for application parameters as well.

```typescript
import { createLoader, schema } from 'configuru'
const loader = createLoader()

const configSchema = loader({
  configurable: schema.string('KEY'),
  static: 'foo',
})
// { configurable: <loaded value>, static: 'foo' }
const { configurable, static } = loader.values()
```

### Default variable names

You don't need to provide variable name to schema if you named the config key same as the key in the configuration.
This can be helpful if you drive your whole config file only by environment variables.

> ⚠️ For nested config keys, the last object key is used for the variable name

```typescript
import { createLoader, schema } from 'configuru'
const loader = createLoader()

const configSchema = loader({
  SERVER_PORT: schema.string(), // Loads from SERVER_PORT env var
  SQL_CONNECTION_STRING: schema.string(), // Loaded from SQL_CONNECTION_STRING env var
  apiKey: schema.string(), // ⚠️ Loaded from apiKey env var
  api: {
    apiKey: schema.string(), // ⚠️ Loaded from apiKey env var
    key: schema.string('apiKey'), // ⚠️ Loaded from apiKey env var
  },
})
const {
  SERVER_PORT,
  SQL_CONNECTION_STRING,
  apiKey,
  api: { apiKey, key },
} = loader.values()
```

### Reloading the config

If you are working in an environment that is able to change the configuration during runtime, `reload`
function can be helpful to load a new configuration based on same settings and schema as the previous one.

```typescript
import { createLoader, schema } from 'configuru'
const loader = createLoader()

const configSchema = loader({
  canChange: schema.string('CHANGEABLE'),
})

const { canChange } = configSchema.values() // old value

// value changed in config file or env variables during runtime

const { canChange } = configSchema.reload().values() // new value
```

### Hidden variables, secrets and logging

`config.ts`

```typescript
import { createLoader, schema } from 'configuru'
const loader = createLoader()

// create `buildConfig` function, we will use two loaders
const configSchema = loader({
  // add hidden flag
  apiKey: schema.string.hidden('SECRET_KEY'),
})

export default configSchema.values()
export const maskedConfig = configSchema.maskedValues()
```

`foo.ts`

```typescript
import config, { maskedConfig } from './config'

// use in your app, never log
config.apiKey // szvor4VYgS79z3QSBtmN0dJeyXbg1Xip

// don't use, is truncated (or hidden for shorter vars) but okay-ish to log
maskedConfig.apiKey // [redacted]
```

### Options

```typescript
import { createLoader } from 'configuru'
const loader = createLoader({
  defaultConfigPath: 'default-config', // defaults to ".env"
  userConfigPath: process.env.USER_CONFIG, // defaults to process.env.CFG_JSON_PATH
  envMode: 'all', // defaults to "default"
})
```

1. `defaultConfigPath`: Where to look for your default config JSON file (provide null to skip)
2. `userConfigPath`: Where to look for your user config JSON file (provide null to skip)
3. `envMode`: How to handle process.env variables
   1. `all` - Load (override) all vars available in process.env to the store
   2. `default` - Load (override) only vars with keys from default config
   3. `merged` - Load (override) only vars with keys from either (user or default) config
   4. `none` - Don't use env variables

🦉 When configuring configuru, you can always use paths with or without extension, it will try to find any of the supported formats via replacing/adding valid extensions.

### Mismatch types

Configuru is type safe, but you can run into problems, having an enum value parsed as a string.
Since there is no enum loader, thus no validation, the value can be anything.

```typescript
const loader = createLoader()
type Level = 'info' | 'warn' | 'unknown'
const createLogger = (opts: { defaultLevel: Level }) => {
  /*...*/
}

const config1 = loader({
  defaultLevel: loader.string('LOGGER_DEFAULT_LEVEL'),
}).values() // type -> { defaultLevel: string }

createLogger(config1) // error: string not assignable to Level
```

To solve it, you can create a custom loader

```typescript
// create custom loader
const levelLoader = schema.custom(x => {
  let level: Level = 'unknown'
  if (x === 'info' || x === 'warn') {
    level = x
  }
  return level
})
// or just
const optimisticLevelLoader = schema.custom(x => x as Level)

const config2 = loader({
  defaultLevel: levelLoader('LOGGER_DEFAULT_LEVEL'),
}).values() // type -> { defaultLevel: Level }

createLogger(config2) // OK
```

### Custom loaders

Default loaders not enough? You can use custom loaders to create any transformation you want and types will be inferred from the return type of you function.

```typescript
// 'PHOTO-2019-04-01' => { type: 'PHOTO', date: Date }
const stampLoader = schema.custom(x => {
  const [type, y, m, d] = x.split('-')
  return { type, date: new Date(y, m, d) }
})

const config = loader({
  stamp: stampLoader('STAMP'),
}).values() // type -> { stamp: { type: any, date: Date } };
```

Custom loaders can also return an object that contains nested loaders. Meaning you can have a custom loader that
loads a value from storage and based on that value returns another objects (or an array of objects) that themselves may contain loaders.

This can be particularly useful for arrays of connection strings that may contain sensitive information like passwords. This will give you type-safe array of objects, while still supporting hidden loaders.

```typescript
// env.json
// {
//   "PASSWORD": "pwd",
//   "HOSTS": "host1,host2"
// }
const configSchema = loader({
  connections: schema.custom(x => {
    return x.split(',').map(host => ({
      host,
      password: schema.string.hidden('PASSWORD'),
    }))
  })('HOSTS'),
})

console.log(configSchema.maskedValues())
// [
//     {
//         "host": "host1",
//         "foo": "[redacted]"
//     },
//     {
//         "host": "host2",
//         "foo": "[redacted]"
//     }
// ]
```
