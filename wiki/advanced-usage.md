## Advanced usage

### Constant parameters
Sometimes it makes sense to have a static parameter in configuration. For example, when connecting to third party service, you want to have api key configurable per environment, but connection options not. You can insert in your configuration schema constant values of any type without loader and use Configuru for application parameters as well.
```typescript
const configSchema = {
    configurable: loader.string('KEY'),
    static: 'foo',
};
// { configurable: <loaded value>, static: 'foo' }
const { configurable, static } = values(configSchema);
```
### Hidden variables, secrets and logging
`config.ts`
```typescript
import { createLoader, values, safeValues } from 'configuru';
const loader = createLoader();

// create `buildConfig` function, we will use two loaders
const configSchema = {
    // add hidden flag
    apiKey: loader.string.hidden('SECRET_KEY'),
};

export default values(configSchema);
export const safeConfig = safeValues(configSchema);
```
`foo.ts`
```typescript
import config, { safeConfig } from './config';

// use in your app, never log
config.apiKey; // szvor4VYgS79z3QSBtmN0dJeyXbg1Xip

// don't use, is truncated (or hidden for shorter vars) but okay-ish to log
safeConfig.apiKey; // szvor***g1Xip
```

### Options
```typescript
import { createLoader } from 'configuru';
const loader = createLoader({
    defaultConfigPath: 'default-config'; // defaults to ".env"
    userConfigPath: process.env.USER_CONFIG; // defaults to process.env.CFG_JSON_PATH
    envMode?: 'all'; // defaults to "default"
});
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
const loader = createLoader();
type Level = 'info'|'warn'|'unknown';
const createLogger = (opts: { defaultLevel: Level }) => { /*...*/ }

const config1 = values({
    defaultLevel: loader.string('LOGGER_DEFAULT_LEVEL'),
}); // type -> { defaultLevel: string }

createLogger(config1); // error: string not assignable to Level
```

To solve it, you can create a custom loader

```typescript
// create custom loader
const levelLoader = loader.custom(x => {
    let level: Level = 'unknown';
    if (x === 'info' || x === 'warn') {
        level = x;
    }
    return level;
});
// or just
const optimisticLevelLoader = loader.custom(x => x as Level);

const config2 = values({
    defaultLevel: levelLoader('LOGGER_DEFAULT_LEVEL'),
}); // type -> { defaultLevel: Level }

createLogger(config2); // OK
```

### Custom loaders

Default loaders not enough? You can use custom loaders to create any transformation you want and types will be inferred from the return type of you function.

```typescript
// 'PHOTO-2019-04-01' => { type: 'PHOTO', date: Date }
const stampLoader = loader.custom(x => {
    const [type, y, m, d] = x.split('-');
    return { type, date: new Date(y, m, d) };
})

const config = values({
    stamp: stampLoader('STAMP'),
}); // type -> { stamp: { type: any, date: Date } };
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
const schema = {
  connections: loader.custom(x => {
    return x.split(',').map(host => ({
      host,
      password: loader.string.hidden('PASSWORD'),      
    }))
  })('HOSTS')
}

console.log(safeValues(schema));
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
