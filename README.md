<div align="center">

<img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/female-mechanic_1f469-200d-1f527.png" width=70 />

<h1>Configuru<img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/gear_2699.png" width=30 /></h1>

[![Build Status](https://flat.badgen.net/travis/AckeeCZ/configuru)](https://travis-ci.com/AckeeCZ/configuru)
[![Npm](https://flat.badgen.net/npm/v/configuru)](https://www.npmjs.com/package/configuru)
[![Coverage](https://flat.badgen.net/codecov/c/github/AckeeCZ/configuru)](https://codecov.io/gh/AckeeCZ/configuru)
[![Vulnerabilities](https://flat.badgen.net/snyk/AckeeCZ/configuru)](https://snyk.io/test/github/AckeeCZ/configuru?targetFile=package.json)
[![Dependency Status](https://flat.badgen.net/david/dep/AckeeCZ/configuru)](https://david-dm.org/AckeeCZ/configuru)
[![Dev Dependency Status](https://flat.badgen.net/david/dep/AckeeCZ/configuru)](https://david-dm.org/AckeeCZ/configuru?type=dev)

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

1. Install

```bash
npm install configuru
```

2. Create `.env.jsonc` in root of your project, add defaults or placeholders.

```jsonc
{
  // HTTP server
  "SERVER_PORT": 3000 // port the server will be listening on
}
```

3. _(optional)_ As a developer (or environment), create a custom override file (e.g. `~/.env/my-project.jsonc`) and save the path in your `CFG_JSON_PATH`.

4. Create a configuration module (e.g. `config.ts`)

```typescript
import { createLoader, values } from 'configuru'

// create loader that cascades overrides and creates a config storage
const loader = createLoader()

// Pass configuration schema to `values` transformer to get configuration
export default values({
  server: {
    // use loader accessors, place them in custom structure
    // loader parses correct type from store
    port: loader.number('SERVER_PORT'),
  },
})
```

5. Use your configuration params throughout your app

```typescript
import config from './config' // e.g. { server: { port: 3000 } }

console.log(config.server.port) // 3000
```

## Docs

- [Config storage precedence](./wiki/storage-precedence.md)
- [Advanced usage](./wiki/advanced-usage.md)
- [Best practices](./wiki/best-practices.md)

## See also

- [`config`](https://www.npmjs.com/package/config) - Simple JSON config loader using NODE_ENV
- [`dotenv`](https://www.npmjs.com/package/dotenv) - Load your configuration file to process.ENV
- [`cosmiconfig`](https://www.npmjs.com/package/cosmiconfig) - Traverse your filesystem to load find your lost configuration file
- [`configstore`](https://www.npmjs.com/package/configstore) - KV storage for configuration
- [`figgy-pudding`](https://www.npmjs.com/package/figgy-pudding) - Config object builder / storage

Know other popular projects that solve the same issue? Open a PR to help people find what they need!

## License

This project is licensed under [MIT](./LICENSE).
