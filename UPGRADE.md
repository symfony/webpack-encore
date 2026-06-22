# Upgrading

## 7.0.0

> [!IMPORTANT]
> v7.0.0 is ESM-only, `Encore.getWebpackConfig()` is now async, Babel 8 is required, and CSS
> minification is no longer enabled by default. These are real breaking changes, so please follow
> the steps below.

The Node.js ecosystem has largely moved to ESM as the standard module format. Most actively maintained
packages now ship ESM-only, and since Encore already requires Node.js `^22.13.0 || >=24.0` (which has
full ESM support), continuing to publish as CJS would mean fighting the ecosystem: pinning to older
dependencies, adding workarounds, and missing out on tree-shaking and static analysis.

Moving to ESM also unlocks `async`/`await` in Encore's internals. Now that `getWebpackConfig()` is
natively async, **Encore can adopt modern async APIs from the ecosystem without hacks**.

- Migrate from CommonJS to ESM: the package now requires `"type": "module"` in your project or
  the use of `.mjs` file extensions. Update your `webpack.config.js`:

    ```js
    // Before (CJS)
    const Encore = require('@symfony/webpack-encore');
    // ...
    module.exports = Encore.getWebpackConfig();

    // After (ESM)
    import Encore from '@symfony/webpack-encore';
    // ...
    export default await Encore.getWebpackConfig();
    ```

    Note: `Encore.getWebpackConfig()` is now **async** and returns a `Promise`. Use `await` at the
    top level of your webpack config (webpack supports async config files natively).

- If you prefer not to add `"type": "module"`, rename your webpack config to `webpack.config.mjs`
  instead; webpack detects the `.mjs` extension and treats it as ESM automatically.

- Replace `__dirname` and `__filename` with their ESM equivalents in your webpack config:

    ```js
    // Before (CJS)
    path.resolve(__dirname, 'src/utilities/');
    config: [__filename];

    // After (ESM)
    path.resolve(import.meta.dirname, 'src/utilities/');
    config: [import.meta.filename];
    ```

- Replace `require()` calls in your webpack config with `import` statements:

    ```js
    // Before (CJS)
    const path = require('path');

    // After (ESM)
    import path from 'path';
    ```

    Similarly, `require.resolve()` becomes `import.meta.resolve()`:

    ```js
    // Before (CJS)
    options.implementation = require.resolve('sass-embedded');

    // After (ESM)
    import { fileURLToPath } from 'url';

    options.implementation = fileURLToPath(import.meta.resolve('sass-embedded'));
    ```

    If you need to require a CJS-only package, use `createRequire`:

    ```js
    import { createRequire } from 'module';
    const require = createRequire(import.meta.url);
    const somePackage = require('cjs-only-package');
    ```

- If you use [StimulusBundle](https://symfony.com/bundles/StimulusBundle/current/index.html), update the `require.context()` call in your `assets/stimulus_bootstrap.js` file (previously `assets/bootstrap.js`)
  to webpack's ESM-friendly `import.meta.webpackContext()`, since `require.context()` is not available in ESM modules:

    ```js
    // Before (CJS)
    export const app = startStimulusApp(
        require.context(
            '@symfony/stimulus-bridge/lazy-controller-loader!./controllers',
            true,
            /\.[jt]sx?$/
        )
    );

    // After (ESM)
    export const app = startStimulusApp(
        import.meta.webpackContext(
            '@symfony/stimulus-bridge/lazy-controller-loader!./controllers',
            {
                recursive: true,
                regExp: /\.[jt]sx?$/,
            }
        )
    );
    ```

- Config files using CJS syntax (`module.exports`, `require()`) must be renamed to `.cjs` if your
  project has `"type": "module"` in its `package.json`, for example:
    - `postcss.config.js` -> `postcss.config.cjs`
    - `babel.config.js` -> `babel.config.cjs`

    Or, preferably, rewrite them as ESM:

    ```js
    // postcss.config.js (ESM)
    import autoprefixer from 'autoprefixer';

    export default {
        plugins: [autoprefixer()],
    };
    ```

- With `"type": "module"`, webpack enables [`resolve.fullySpecified`](https://webpack.js.org/configuration/module/#resolvefullyspecified) by default, so **file extensions are now required**
  in some imports that previously worked without them:
    - **Relative imports**: `import('./my-dependency')` -> `import('./my-dependency.js')`
    - **Deep package imports** from packages without an `"exports"` field, for example:
        - `import delegate from 'licia/delegate'` -> `import delegate from 'licia/delegate.js'`
        - `import 'jquery-ui/ui/widgets/progressbar'` -> `import 'jquery-ui/ui/widgets/progressbar.js'`

- The package `"exports"` field is now restrictive: only `"@symfony/webpack-encore"` and`"@symfony/webpack-encore/lib/plugins/plugin-priorities.js"` are exposed as public entry points.
  Direct imports of other internal modules will no longer work.

- Drop support for Babel 7 and require [Babel 8](https://babeljs.io/docs/v8-migration/): `@babel/core`, `@babel/preset-env`, `@babel/preset-react`, `@babel/preset-typescript`,
  and `@babel/plugin-transform-react-jsx` now require `^8.0.0`. Upgrade your Babel dependencies and follow
  the [migration guide](https://babeljs.io/docs/v8-migration/).

- Raise the minimum Node.js version to `^22.18.0 || ^24.11.0 || >=26.0` (required by Babel 8).

- Yarn Plug'n'Play users must upgrade to Yarn `>=4.6.0` for proper resolution of ESM-only Babel 8
  packages: `yarn set version 4.6.0`.

- The `useBuiltIns` and `corejs` options of `Encore.configureBabel()` / `Encore.configureBabelPresetEnv()` are no longer
  supported: Babel 8 removed them from `@babel/preset-env`. Encore now throws an explicit error when they are set.
  To polyfill, use [`babel-plugin-polyfill-corejs3`](https://github.com/babel/babel-polyfills) via
  `Encore.configureBabel((babelConfig) => babelConfig.plugins.push(...))` or an external Babel config.

- Without a `browserslist` configuration, Babel 8's `@babel/preset-env` targets modern browsers by
  default instead of compiling to ES5. Add a `browserslist` configuration to your project to transpile
  for older browsers.

- The archived `css-minimizer-webpack-plugin` and `terser-webpack-plugin` packages have been
  replaced by the unified [`minimizer-webpack-plugin`](https://github.com/webpack/minimizer-webpack-plugin).
  Minifier packages (`lightningcss`, `cssnano`, `csso`, `clean-css`, `esbuild`, `@swc/*`, `uglify-js`) are now
  optional peer dependencies, installed on demand. In particular `cssnano`, previously pulled in
  transitively by `css-minimizer-webpack-plugin`, is no longer installed by default.

- `Encore.configureTerserPlugin()` has been removed. Use `Encore.configureJsMinimizerPlugin()`
  instead (it takes the same callback).

- **CSS minification is no longer enabled by default.** Choose and configure a CSS minifier via
  `configureCssMinimizerPlugin()`; otherwise CSS is not minified in production. The JS minimizer
  (Terser, bundled inside `minimizer-webpack-plugin`) still works with no extra setup.

    The `MinimizerPlugin` class is passed as the second argument of the callback, so you don't need
    to import `minimizer-webpack-plugin` yourself (it would not resolve under pnpm, being a
    transitive dependency of Encore):

    ```js
    // Lightning CSS, fast Rust-based minifier (npm install --save-dev lightningcss)
    Encore.configureCssMinimizerPlugin((options, MinimizerPlugin) => {
        options.minify = MinimizerPlugin.lightningCssMinify;
    });

    // cssnano, PostCSS-based, closest to previous default (npm install --save-dev cssnano postcss)
    Encore.configureCssMinimizerPlugin((options, MinimizerPlugin) => {
        options.minify = MinimizerPlugin.cssnanoMinify;
    });
    ```

    Other supported CSS minimizers: `csso`, `clean-css`, `esbuild` (`esbuildMinifyCss`),
    `@swc/css` (`swcMinifyCss`). See the [minimizer-webpack-plugin documentation](https://github.com/webpack/minimizer-webpack-plugin)
    for all available options.
