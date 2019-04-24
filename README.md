<div align="center">

# :wrench: Configuru

[![Build Status](https://img.shields.io/travis/com/AckeeCZ/configuru/master.svg?style=flat-square)](https://travis-ci.com/AckeeCZ/configuru)
[![Npm](https://img.shields.io/npm/v/configuru.svg?style=flat-square)](https://www.npmjs.com/package/configuru)
[![Coverage](https://img.shields.io/codeclimate/coverage/AckeeCZ/configuru.svg?style=flat-square)](https://codeclimate.com/github/AckeeCZ/configuru)
[![Maintainability](https://img.shields.io/codeclimate/maintainability/AckeeCZ/configuru.svg?style=flat-square)](https://codeclimate.com/github/AckeeCZ/configuru)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/AckeeCZ/configuru.svg?style=flat-square)](https://snyk.io/test/github/AckeeCZ/configuru?targetFile=package.json)
[![Dependency Status](https://img.shields.io/david/AckeeCZ/configuru.svg?style=flat-square)](https://david-dm.org/AckeeCZ/configuru)
[![Dev Dependency Status](https://img.shields.io/david/dev/AckeeCZ/configuru.svg?style=flat-square)](https://david-dm.org/AckeeCZ/configuru?type=dev)


Manage the configuration of your Nodejs application with multiple environments and custom preferences, utilizing Configuru in CI and development as well!

</div>

## Features

Configuru is a library for configuration management. Merge default project configuration with your user config, you can link yo your project. Atop of that, override your configuration with system environment variables.

 - :relieved: Tailored for multi-developer comfort
 - :sparkles: Cast inputs to correct type
 - :blue_heart: Typescript friendly
 - :muscle: Designed for multi-environment apps
 - :see_no_evil: Anonymized configuration for logger


## Getting started
### Install

```bash
npm install configuru
```

### Setup
1. Create `.env.json` in root of your project, add defaults and placeholders
2. _(optional)_ Create custom (e.g. `~/.env/my-project.json`) and save the path in your `CFG_JSON_PATH`. Use it to override your defaults

### Use
`config.ts`
```typescript
import { createLoaders } from 'configuru';

// create loader that cascades overrides and creates a config storage
const { configLoader } = createLoaders();

export default {
    server: {
        // use loader accessors, place them in custom structure
        // loader parses correct type from store
        port: configLoader.number('SERVER_PORT'),
    },
};
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

### Hidden variables, secrets and logging
`config.ts`
```typescript
import { createLoaders } from 'configuru';
const { anonymizedConfigLoader, configLoader } = createLoaders();

// create `buildConfig` function, we will use two loaders
const buildConfig = (loader: typeof configLoader) => ({
    // add hidden flag
    apiKey: loader.string.hidden('SECRET_KEY'),
});

export default buildConfig(configLoader);
export const safeConfig = buildConfig(anonymizedConfigLoader);
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
import { createLoaders } from 'configuru';
const { configLoader } = createLoaders({
    defaultConfigPath: 'default-config.json'; // defaults to ".env.json"
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

### Types don't match

Configuru is type safe, but you can run into problems, having an enum value parsed as a string.
Since there is no enum loader, thus no validation, the value can be anything.

Suggested solution is to be optimistic and typecast it :speak_no_evil:

```typescript
type Level = 'info'|'warn';
const createLogger = (level: Level) => {/*...*/}

const config1 = {
    defaultLevel: loader.string('LOGGER_DEFAULT_LEVEL'),
}; // type -> { defaultLevel: string }

createLogger(config1); // error: string not assignable to Level

const config2 = {
    defaultLevel: loader.string('LOGGER_DEFAULT_LEVEL') as Level,
}; // type -> { defaultLevel: Level }

createLogger(config2); // OK
```


## Best practices
 - Always use flat structure in JSON files (create logical hierarchy in your app when building config with loader)
 - For config keys, use `CAPITALIZED_WITH_UNDERSCORES` case, as is conventional for env variables
 - Keep all variables used by loader in you default config, keep it version in the project. Store default values or placeholders. It will be a perfect starting point for custom configs.


## See also

- [`config`](https://www.npmjs.com/package/config) - Simple JSON config loader using NODE_ENV
- [`dotenv`](https://www.npmjs.com/package/dotenv) - Load your configuration file to process.ENV
- [`cosmiconfig`](https://www.npmjs.com/package/cosmiconfig) - Traverse your filesystem to load find your lost configuration file
- [`configstore`](https://www.npmjs.com/package/configstore) - KV storage for configuration
- [`figgy-pudding`](https://www.npmjs.com/package/figgy-pudding) - Config object builder / storage


## License

This project is licensed under [MIT](./LICENSE).
