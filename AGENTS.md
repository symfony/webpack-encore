# AGENTS.md - Symfony Webpack Encore

This file provides guidance for AI coding agents working on this codebase.

## Project Overview

Symfony Webpack Encore is a JavaScript/Node.js library that wraps Webpack, providing a clean
and powerful API for bundling JavaScript modules, pre-processing CSS & JS, and compiling assets.

- **Package**: `@symfony/webpack-encore`
- **License**: MIT
- **Node.js**: `^22.13.0 || >=24.0`

## Environment Setup

**IMPORTANT**: Before running any command, ensure you are using the correct Node.js version:

```bash
nvm use 22
```

Then install dependencies:

```bash
pnpm install
```

## Build/Lint/Test Commands

### Linting

```bash
pnpm lint
```

Runs ESLint on whole codebase. Use `pnpm lint --fix` to automatically fix issues where possible.

### Formatting

```bash
pnpm fmt:check
pnpm fmt
```

Runs Oxfmt on whole codebase. Use `pnpm fmt` to automatically format code.

### Testing

```bash
# Run tests
pnpm test

# Run a single test file
pnpm vitest run test/WebpackConfig.js
pnpm vitest run test/loaders/sass.js

# Run tests matching a pattern
pnpm vitest run -t "setOutputPath"

# Run functional tests only
pnpm vitest run test/functional.js
```

Test files mirror the source structure: `lib/loaders/sass.js` → `test/loaders/sass.js`

## Code Style Guidelines

### File Header (Required)

Every JavaScript file MUST start with this header:

```javascript
/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';
```

### Formatting Rules

- **Indentation**: 4 spaces
- **Quotes**: Single quotes (`'string'`)
- **Semicolons**: Required
- **Trailing whitespace**: Not allowed
- **End of file**: Must have newline
- **Line endings**: LF (Unix-style)
- **Object braces**: Spaces inside (`{ key: value }`)
- **Function parens**: No space before (`function()` not `function ()`)
- **Equality**: Always use `===` and `!==` (eqeqeq)

### Import Style (CommonJS)

```javascript
'use strict';

// Node.js built-ins first
const path = require('path');
const fs = require('fs');

// External packages
const webpack = require('webpack');
const semver = require('semver');

// Internal modules (relative paths)
const WebpackConfig = require('./lib/WebpackConfig');
const logger = require('./logger');
const applyOptionsCallback = require('./utils/apply-options-callback');
```

### JSDoc Type Imports

Use JSDoc `@import` for type information:

```javascript
/**
 * @import WebpackConfig from '../WebpackConfig'
 */

/**
 * @import webpack from 'webpack'
 */

/**
 * @import { OptionsCallback } from './utils/apply-options-callback.js'
 */
```

### Naming Conventions

| Type                | Convention       | Examples                               |
| ------------------- | ---------------- | -------------------------------------- |
| Files (general)     | kebab-case       | `config-generator.js`, `path-util.js`  |
| Files (classes)     | PascalCase       | `WebpackConfig.js`, `RuntimeConfig.js` |
| Variables/Functions | camelCase        | `webpackConfig`, `getLoaders()`        |
| Classes             | PascalCase       | `WebpackConfig`, `RuntimeConfig`       |
| Constants           | UPPER_SNAKE_CASE | (rarely used)                          |

### Method Naming Patterns

- **Getters**: `getLoaders()`, `getContext()`, `getWebpackConfig()`
- **Setters**: `setOutputPath()`, `setPublicPath()`
- **Enablers**: `enableVersioning()`, `enableSassLoader()`, `enableVueLoader()`
- **Configurers**: `configureBabel()`, `configureDefinePlugin()`
- **Validators**: `validateRuntimeConfig()`, `validateNameIsNewEntry()`
- **Booleans**: Prefix with `use`, `is`, `should`, `has`:
    - `useVersioning`, `useSourceMaps`, `isProduction()`, `shouldUseSingleRuntimeChunk`

### Error Handling

Throw descriptive errors with context:

```javascript
if (typeof callback !== 'function') {
    throw new Error('Argument 1 to configureBabel() must be a callback function or null.');
}

// Include valid options in error messages
throw new Error(
    `Invalid option "${optionKey}" passed to method(). Valid keys are ${Object.keys(validOptions).join(', ')}`
);
```

Use the logger for warnings, recommendations, and deprecations:

```javascript
const logger = require('./logger');

logger.warning('The value passed to setPublicPath() should usually start with "/"');
logger.recommendation('To create a smaller build, see https://symfony.com/doc/...');
logger.deprecation('The "https" option is deprecated, use "server" instead');
```

### Test Structure

Tests use Vitest with native expect assertions:

```javascript
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import WebpackConfig from '../lib/WebpackConfig.js';

describe('WebpackConfig object', function () {
    describe('setOutputPath', function () {
        it('use absolute, existent path', function () {
            const config = createConfig();
            config.setOutputPath(__dirname);
            expect(config.outputPath).toBe(__dirname);
        });
    });
});
```

Test helpers are in `test/helpers/`:

- `setup.js`: `createWebpackConfig()`, `runWebpack()`, `createTestAppDir()`
- `assert.js`: Custom assertions for webpack output

Vitest automatically restores all mocks and stubs after each test via `test/vitest-setup.js`.

## Directory Structure

```
lib/                    # Core library source
├── config/             # Configuration parsing & validation
├── loaders/            # Webpack loader configurations
├── plugins/            # Webpack plugin configurations
├── utils/              # Utility functions
├── friendly-errors/    # Custom error handlers
├── WebpackConfig.js    # Main configuration class
└── config-generator.js # Webpack config generator

test/                   # Tests (mirrors lib/ structure)
fixtures/               # Test fixtures
```

## Contributing Guidelines

- Always add tests and ensure they pass
- Never break backward compatibility
- Update CHANGELOG.md for new features/deprecations
- Features must be submitted against the latest branch
