# CHANGELOG

## 0.27.0

 * [Behavior Change] The Babel configuration `sourceType` default was
   changed from not being specified (so, the default `module` was used)
   to `unambiguous`. This is to help Babel's `useBuiltIns` functionality
   properly determine if a `require` or `import` should be automatically
   added to your files, based on that file's style - #555 thanks to @Lyrkan.

 * Added JSX support to Vue! #553 thanks to @Kocal.

 * Cleaned up the jsdoc in `index.js` to add better docs and better
   IDE auto-completion - #550 thank sto @Lyrkan.

## 0.26.0

 * [Behavior change] The Babel `useBuiltIns` option default value changed
   from `entry` to `false`, which means that polyfills may no longer be
   provided in the same way. This is due to a change in Babel and core-js.
   To get the same functionality back, run `yarn add core-js --dev`, then use:

   ```js
   Encore.configureBabel(() => {}, {
       useBuiltIns: 'entry', // or try "usage"
       corejs: 3
   })
   ```

   This comes from #545 thanks to @Lyrkan.

 * Added the ability to "resolve" CSS and Sass files without specifying
   the file extension and by taking advantage of the `sass` or `style`
   attribute in an npm package. For example, you can now import the main
   Bootstrap SASS file from within a SASS file by saying `@import ~bootstrap`.
   This will use the `sass` attribute from the bootstrap `package.json`
   file to find which file to load. #474 thanks to @deAtog.

 * Added a new `Encore.enableIntegrityHashes()`, which will cause a new
   `integrity` key to be added to `entrypoints.json` with integrity values
   that can be included in the `script` or `link` tag for that asset - #522
   thanks to @Lyrkan.

 * Allow some parts of `configureBabel()` to be used, even if there is
   an external `.babelrc` configuration file - #544 thanks to @Lyrkan.

## 0.25.0

 * [BC BREAK] Various dependency versions were updated, including
   `css-loader` updated from `^1.0.0` to `^2.1.1` and `resolve-url-loader`
   updated from `^2.3.0` to `^3.0.1`. The minimum Node version was
   also bumped from 6 to 8. See #540 for more details.

 * Added `Encore.disableCssExtraction()` if you prefer your CSS to
   be output via the `style-loader` - #539 thank to @Lyrkan.

 * Added `Encore.configureLoaderRule()` as a way to configure the
   loader config that Encore normally handles - #509 thanks to @Kocal.

 * Babel cache is no longer used for production builds to avoid a
   bug where the cache prevents browserslist from being used - #516
   thanks to @Lyrkan.

## 0.24.0

 * Add CSS modules support in Vue.js for Sass/Less/Stylus - #511
   thanks to @Lyrkan

 * Allow to use Dart Sass instead of Node Sass - #517 thanks to
   @Lyrkan

 * Allow to set a custom context in copyFiles - #518 thanks to
   @Lyrkan

 * Improve 'Install x to use y' and 'Unrecognized method' error
   messages - #520 thanks to @Lyrkan

 * Allow to set @babel/preset-env's useBuiltIns option - #521
   thanks to @Lyrkan

 * Allow setOutputPath to create nested directories - #525 thanks
   to @Lyrkan

## 0.23.0

 * Add support for CSS modules in Vue - #508 thanks to @Lyrkan

 * Store externals in an array - #495 thanks to @deAtog

 * Add `Encore.isRuntimeEnvironmentConfigured()` - #500 thanks
   to @stof.

 * Add the ability to configure watch options - #486 thanks
   to @Kocal

 * Enabled cache and parallelism for terser for faster builds -
   #497 thanks to @Kocal

## 0.22.0

 * [BC BREAK] The values/paths in entrypoints.json were previously
   stripped of their opening slash. That behavior has been changed:
   the opening slash is now included: Before: `build/foo.js`, After: `/build/foo.js`.

## 0.21.0

 * [BC BREAK] Webpack was upgraded to version 4. This includes a number of major
   and minor changes. The changes are listed below under the
   `Webpack 4 Upgrade` section.

 * [BC BREAK] The `createSharedEntry()` no longer can be passed an array of files.
   Instead, set this to just one file, and require the other files from inside that
   file.

 * [DEPRECATION] You must now call either `Encore.enableSingleRuntimeChunk()`
   or `Encore.disableSingleRuntimeChunk()`: not calling either method is
   deprecated. The recommended setting is `Encore.enableSingleRuntimeChunk()`.
   This will cause a new `runtime.js` file to be created, which must be included
   on your page with a script tag (before any other script tags for Encore
   JavaScript files). See the documentation above `enableSingleRuntimeChunk()` in
   `index.js` for more details.

 * [BEHAVIOR CHANGE] Previously, without any config, Babel was
   configured to "transpile" (i.e. re-write) your JavaScript so
   that it was compatible with all browsers that currently have
   more than 1% of the market share. The new default behavior
   is a bit more aggressive, and may rewrite even more code to
   be compatible with even older browsers. The *recommendation*
   is to add a new `browserslist` key to your `package.json` file
   that specifies exactly what browsers you need to support. For
   example, to get the old configuration, add the following to
   `package.json`:

```json
{
    "browserslist": "> 1%"
}
```

See the [browserslist](https://github.com/browserslist/browserslist) library
for a full description of all of the valid browser descriptions.

 * Added a new `copyFiles()` method that is able to copy static files
   into your build directory and allows them to be versioned. #409
   thanks to @Lyrkan

 * Introduced a new `configureSplitChunks()` method that can be
   used to further configure the `optimizations.splitChunks` configuration.

 * A new `entrypoints.json` file is now always output. For expert
   use-cases, the `optimizations.splitChunks.chunks` configuration
   can be set via `configureSplitChunks()` to `all`. Then, you
   can write some custom server-side code to parse the `entrypoints.js`
   so that you know which `script` and `link` tags are needed for
   each entry.

 * The "dynamic import" syntax is now supported out of the box
   because the `@babel/plugin-syntax-dynamic-import` babel plugin
   is always enabled. This allows you to do "Dynamic Imports"
   as described here: https://webpack.js.org/guides/code-splitting/#dynamic-imports

 * A new "version check" system was added for optional dependencies.
   Now, when you install optional plugins to support a feature, if
   you are using an unsupported version, you will see a warning.
   "Package recommendation" errors (i.e. when you enable a feature
   but you are missing some packages) will also contain the version
   in the install string when necessary (e.g. `yarn add foo@^2.0`).

 * Support was added `handlebars-loader` by calling `enableHandlebarsLoader()`.
   #301 thanks to @ogiammetta

 * Support was added for `eslint-loader` by calling `enableEslintLoader()`.
   #243 thanks to @pinoniq

 * The `css-loader` can now be configured by calling `configureCssLoader()`.
   #335 thanks to @XWB

 * It's now possible to control the `exclude` for Babel so that you can
   process certain node_modules packages  through Babel - use
   the new second argument to `configureBabel()` - #401 thanks to
   @Lyrkan.

## Webpack 4 Upgrade Details

 * Node 7 is no longer supported. This is because the new
   `mini-css-extract-plugin` does not support it (and neither)
   does Yarn.

 * For Preact, the necessary plugin the user needs to install
   changed from `babel-plugin-transform-react-jsx` to `@babel/plugin-transform-react-jsx`.

 * The NamedModulesPlugin was removed.

 * The `babel-preset-env` package (which was at version ^1.2.2) was
   removed in favor of `@babel/preset-env`.

 * ExtractTextPlugin was removed and replaced with
   mini-css-extract-plugin. Accordingly, `extractTextPluginOptionsCallback()`
   was removed.

 * Support for CoffeeScript was entirely removed.

 * Actual lang="sass" no longer works for Vue. However, lang="scss"
   continues to work fine.

 * uglifyjs-webpack-plugin was replaced by terser-webpack-plugin.
   If you're using `configureUglifyJsPlugin()`, please switch to
   `configureTerserPlugin()` instead.

## 0.20.1

 * Upgraded webpack-manifest-plugin from 2.0.0 RC1 to ^2.0.0.
   The original RC version was not meant to be used in a release.
   #306 via @weaverryan

## 0.20.0

 * Added `Encore.configureUrlLoader()` method that allows you
   to inline smaller images/file assets for better performance
   #296 via @Lyrkan

 * Improved error messages that recommend using yarn vs npm
   #291 via @Lyrkan

 * Fixed bug with using --stats option #299 via @Lyrkan

 * Allow configuration callbacks to return their value
   #300 via @Lyrkan

 * Updated to use the new v2 of webpack-manifest-plugin
   #164 via @weaverryan

## 0.19.0

 * Updated how Encore is exported to support better IDE auto-completion
   #263 via @florentdestremau

## 0.18.0

 * Added `Encore.addAliases()` and `Encore.addExternal()` shortcut methods
   #217 via @Lyrkan

 * Fixed hash lengths - normalized all to 8 - #216 via @Lyrkan

 * Added CoffeeScript loader - #201 via @harentius

## 0.17.0

 * Added build notifications by calling `Encore.enableBuildNotifications()` -
   #190 via @Lyrkan

 * Added Stylus support via `Encore.enableStylusLoader()` - #195
   via @mneuhaus

## 0.16.0

 * Added a priority argument to the `addPlugin()` method so that we
    can (mostly in the future) allow plugins to be ordered, if/when
    that becomes necessary - #177 via @Lyrkan

 * Fixed several minor bugs related to extra `.map` files (#170),
    always having a DefinePlugin enabled (#172), fixing extra
    instances of the ts-loader (#181) and upgrading a dependency
    to avoid a deprecation warning (#182) - all via @Lyrkan

## 0.15.1

 * Fixed bug with using `?` in your versioning strategy with
   `addStyleEntry` - #161 via @Lyrkan

 * Fixed bug when using `webpack.config.babel.js` with ES6
   imports - #167 via @Lyrkan

## 0.15.0

 * Add support for [Preact](https://preactjs.com/) - #144 via @Lyrkan
 
 * Added `Encore.configureManifestPlugin()` method - #142 via @Seikyo

 * Added 5 new methods to configure plugins! #152 via @Lyrkan
   * `Encore.configureDefinePlugin()`
   * `Encore.configureExtractTextPlugin()`
   * `Encore.configureFriendlyErrorsPlugin()`
   * `Encore.configureLoaderOptionsPlugin()`
   * `Encore.configureUglifyJsPlugin()`

## 0.14.0

 * Added `Encore.configureFilenames()` so that you can fully control
   the filename patterns for all types of files - #137 via @Lyrkan

 * Added `Encore.configureRuntimeEnvironment()`, which is useful
   if you need to require `webpack.config.js` from some non-Encore
   process (e.g. Karma) - #115 via @Lyrkan

## 0.13.0

 * [BEHAVIOR CHANGE] Image and font files now *always* include
   a hash in their filename, and the hash is shorter - #110 via @Lyrkan

 * Fixed a bug that caused extra comments to be in the final production
   compiled JavaScript - #132 via @weaverryan

 * `Encore.enablePostCssLoader()` now accepts an options callback -
   #130 via @Lyrkan

 * `Encore.enableLessLoader()` now accepts an options callback -
   #134 via @Lyrkan

 * Added `Encore.enableForkedTypeScriptTypesChecking()` to enable
   [fork-ts-checker-webpack-plugin](https://github.com/Realytics/fork-ts-checker-webpack-plugin)
   for faster typescript type checking - #101 via @davidmpaz

 * Added `Encore.disableImagesLoader()` and `Encore.disableFontsLoader()`
   to totally disable the `file-loader` rules for images and fonts -
   #103 via @Lyrkan

## 0.12.0

 * Fixed a bug with webpack 3.4.0 ("Can't resolve dev") - #114.

 * Added `--keep-public-path` option to `dev-server` that allows
   you to specify that you do *not* want your `publicPath` to
   automatically point at the dev-server URL. Also relaxed the
   requirements when using `dev-server` so that you *can* now
   specify a custom, fully-qualified `publicPath` URL - #96

 * Fixed bug where `@import` CSS wouldn't use postcss - #108

## 0.11.0

 * The `webpack` package was upgraded from version 2.2 to 3.1 #53. The
    `extract-text-webpack-plugin` package was also upgraded from
    2.1 to 3.0.

## 0.10.0

 * [BC BREAK] If you're using `enableSassLoader()` AND passing an options
   array, the options now need to be moved to the second argument:

   ```js
   // before
   .enableSassLoader({ resolve_url_loader: true });

   // after
   enableSassLoader(function(sassOptions) {}, {
       resolve_url_loader: true
   })
   ```

 * Allowing typescript options callback to be optional - #75

 * Allow the Encore singleton to be reset - #83

 * Fixing bug with vue-loader and sass - #89

## 0.9.1

 * Syntax error fix - #64

## 0.9.0

 * [BEHAVIOR CHANGE] When using `autoProvidejQuery()`, `window.jQuery` is now also
   included (and so will be re-written in the compiled files). If you're also exposing
   `jQuery` as a global variable, you'll need to update your code:

   ```js
   // Before: if you had this
   window.jQuery = require('jquery');

   // After: change to this
   global.jQuery = require('jquery');
   ```

  * Vue.js support! See #49

  * Typescript support! See #50

## 0.8.0

 * Windows support fixed #28

 * Added `Encore.addPlugin()` #19

 * Added `Encore.addLoader()` #11

 * `Encore.cleanupOutputBeforeBuild()` now empties the directory
   instead or removing it.

