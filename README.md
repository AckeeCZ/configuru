<div align="center">

![](logo.png)

<h1>Configuru</h1>

Manage the configuration of your Nodejs application with multiple environments and custom preferences, utilizing Configuru in CI and development as well!

Improve the DX when managing the configuration files, get inline help and more with the [VS Code extension](https://github.com/AckeeCZ/configuru-extension).

</div>

## Features

Configuru is a library for configuration management. Merge default project configuration with your user config, you can link yo your project. Atop of that, override your configuration with system environment variables.

- :relieved: Tailored for multi-developer comfort
- :sparkles: Cast and transforms inputs to the correct type
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

   Tip: Use inline secrets like `CFG_JSON_PATH='{"mysecret":"Sssshhh..."}'` or load from GCP Secret Manager: `CFG_JSON_PATH=$(gcloud secrets versions access latest --project=myproject --secret=mysecret)`

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
