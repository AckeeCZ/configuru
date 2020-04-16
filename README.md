<div align="center">

<img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/female-mechanic_1f469-200d-1f527.png" width=70 />

<h1>Configuru<img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/gear_2699.png" width=30 /></h1>


[![Build Status](https://img.shields.io/travis/com/AckeeCZ/configuru/master.svg?style=flat-square)](https://travis-ci.com/AckeeCZ/configuru)
[![Npm](https://img.shields.io/npm/v/configuru.svg?style=flat-square)](https://www.npmjs.com/package/configuru)
[![Coverage](https://img.shields.io/codecov/c/github/AckeeCZ/configuru?style=flat-square)](https://codecov.io/gh/AckeeCZ/configuru)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/AckeeCZ/configuru.svg?style=flat-square)](https://snyk.io/test/github/AckeeCZ/configuru?targetFile=package.json)
[![Dependency Status](https://img.shields.io/david/AckeeCZ/configuru.svg?style=flat-square)](https://david-dm.org/AckeeCZ/configuru)
[![Dev Dependency Status](https://img.shields.io/david/dev/AckeeCZ/configuru.svg?style=flat-square)](https://david-dm.org/AckeeCZ/configuru?type=dev)


Manage the configuration of your Nodejs application with multiple environments and custom preferences, utilizing Configuru in CI and development as well!

</div>

## Features

Configuru is a library for configuration management. Merge default project configuration with your user config, you can link yo your project. Atop of that, override your configuration with system environment variables.

 - :relieved: Tailored for multi-developer comfort
 - :sparkles: Cast and transforms inputs to correct type
 - :blue_heart: Typescript friendly
 - :muscle: Designed for multi-environment apps
 - :see_no_evil: Anonymized configuration for logger
 - 💬 JSONC support


## Getting started
### Install

```bash
npm install configuru
```

### Setup
1. Create `.env.jsonc` in root of your project, add defaults or placeholders. It can look like this:
```jsonc
{
    // HTTP server
    "SERVER_PORT": 3000, // port the server will be listening on
}
```
2. _(optional)_ Create custom (e.g. `~/.env/my-project.jsonc`) and save the path in your `CFG_JSON_PATH`. Use it to override your defaults
```json
{
    "SERVER_PORT": 3001,
}
```
🦉 If you want to, you can omit the `SERVER_PORT` in your configuration (to leave the single value to default `3000`), or not set your custom configuration at all.

### Use
`config.ts`
```typescript
import { createLoader, values } from 'configuru';

// create loader that cascades overrides and creates a config storage
const loader = createLoader();

// Pass configuration schema to `values` transformer to get configuration
export default values({
    server: {
        // use loader accessors, place them in custom structure
        // loader parses correct type from store
        port: loader.number('SERVER_PORT'),
    },
});
```

`foo.ts`
```typescript
import config from './config'; // e.g. { server: { port: 3000 } }

console.log(config.server.port); // 3000
```


## Config storage precedence

Configuration is merged from three sources with override priorities as described in the following diagram.


![x](https://www.plantuml.com/plantuml/svg/0/VP4zJyD038Rt-nLM9XWITiHGAGnyI7HWOZpkdFPeOXy-En8IFvvBcw7jmFhQVfvNygQe5xLfTEMGA7ln4qnC7FR24uAAeND36X6QY8EtKI4m3MdNW2yGrv4LbFFSNF0I8Gi7BAL3cfSqEqUi299sUmKUwldZohofDJI5MtXvtxwjfCwz8cP8j72-C2Wiij8vf0WBw1fdhhUYFC6npXrKRHAc2KalkJsJ-aG52WP1BS1IWTIUIbHZDlt7azq7crpWPo_9VnxRFNcAFp1KvBUbS02UKIH5N2JzyparmiDlsuBTGmEmNTTAu-oKv-jyKq_hf_u0 "x")


:warning: All storage sources are regarded as flat structures. Nested objects are not merged.

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

## Best practices
 - Always **use flat structure** in JSON files (create logical hierarchy in your app when building config with loader)
 - For config keys, **use `CAPITALIZED_WITH_UNDERSCORES` case**, as is conventional for env variables
 - **Keep all variables used by loader in you default config**, add to VCS. Store default values or placeholders. It will be a perfect starting point for custom configs.
 - Keep your configuration interface **minimal**. If you don't need to configure parameter for different environments, use constant parameter without loader.
 - Even though you can use plain `JSON` for config values, **prefer `JSONc`** and add comments to your variables.
 - **Keep your `.env.jsonc` well structured and well documented**. Setting up the configuration should not require thorough prior knowledge of the implementation.

### When to use placeholder, when default value?

![](http://www.plantuml.com/plantuml/svg/POwnJWCn38RtF8KbbkihqA5bP623xHRVdNCnEFOfSO2-FQ65WbGFaNxz__Sfn-fOl6K9zOrrmu8PigdDgLWcyDBeNxDGn2R-J9_-8Bng9dMO-qCbd4KXS8HXr2TyjS9-0elGAfKAipLPHkq1FjYJjGucr9LrFOow0q-aC9oexWBq-zOyLc3le4PUI9rH3ZSxaYuSr7hwkRjfckvVAlr-5jvH6kslVNNRBgWk7CEVu9B3bTy4Pqgs29LzE5FXs3SjonS0)

Examples:
 - Setting default of `SQL_PORT` to `5432` is a good idea if you are using PostgreSQL. Similarly for MySQL, a reasonable default value would be `3306`
 - Default `3000` for your HTTP server might be reasonable, if it is a convention of your developer team and/or its is wired e.g. in your Dockerfile anyway. Developers can still change it collides with any local running processes.
 - Using credentials to your testing infrastructure as a default is wrong, even though it would make setup for developers easier in some scenarios. It would be confidential info in your repo history.

### Recommended structure for `.env.jsonc`

```jsonc
{
    // Server
    "SERVER_PORT": 3000,

    // Development
    "LOGGER_PRETTY": false, // colorful formatted logs
    "DEV_ERRORS": false, // if true, return error details, including stack trace (affects only response, full details are always logged)

    // Logging
    "LOGGER_DEFAULT_LEVEL": "debug", // silent, fatal, error, warn, info, debug, trace
}
```
1. If you find your configuration file harder to navigate through, use sections seperated by a newline with a comment
2. If name is not self-explanatory, use brief comment to explain how is the value interpreted
3. Do not include tautological comments (`"SERVER_PORT": 3000, // server port`)

## See also

- [`config`](https://www.npmjs.com/package/config) - Simple JSON config loader using NODE_ENV
- [`dotenv`](https://www.npmjs.com/package/dotenv) - Load your configuration file to process.ENV
- [`cosmiconfig`](https://www.npmjs.com/package/cosmiconfig) - Traverse your filesystem to load find your lost configuration file
- [`configstore`](https://www.npmjs.com/package/configstore) - KV storage for configuration
- [`figgy-pudding`](https://www.npmjs.com/package/figgy-pudding) - Config object builder / storage


## License

This project is licensed under [MIT](./LICENSE).
