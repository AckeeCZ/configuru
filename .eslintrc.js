const config = require('@ackee/styleguide-backend-config/eslint')

module.exports = {
  ...config,
  rules: {
    ...config.rules,
    'security/detect-non-literal-fs-filename': 0,
    'sonarjs/no-ignored-exceptions': 0,
  },
}
