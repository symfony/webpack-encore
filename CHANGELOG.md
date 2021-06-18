# CHANGELOG

## [v1.5.0](https://github.com/symfony/webpack-encore/releases/tag/v1.5.0)

*June 18th, 2021*

### Feature

- [#1000](https://github.com/symfony/webpack-encore/pull/1000) - Allow ts-loader ^9.0.0, close #993 - *@Kocal*
- [#999](https://github.com/symfony/webpack-encore/pull/999) - Allow sass-loader ^12.0.0, close #996 - *@Kocal*

## [v1.4.0](https://github.com/symfony/webpack-encore/releases/tag/v1.4.0)

*May 31st, 2021*

### Feature

- [#983](https://github.com/symfony/webpack-encore/pull/983) - Allow less-loader v9 - *@bobvandevijver*

### Bug Fix

- [#979](https://github.com/symfony/webpack-encore/pull/979) - #936: Fix manifest key problem when using copy files - *@bobvandevijver*

## [v1.3.0](https://github.com/symfony/webpack-encore/releases/tag/v1.3.0)

*May 11th, 2021*

### Feature

- [#976](https://github.com/symfony/webpack-encore/pull/976) - Change friendly-errors-webpack-plugin to `@nuxt`/friendly-errors-webpack-plugin - *@hailwood*

### Bug Fix

- [#975](https://github.com/symfony/webpack-encore/pull/975) - Resolve security issue CVE-2021-23369 - *@elghailani*

## [v1.2.0](https://github.com/symfony/webpack-encore/releases/tag/v1.2.0)

*May 3rd, 2021*

### Feature

- [#968](https://github.com/symfony/webpack-encore/pull/968) - Locking assets-webpack-plugin to less than 7.1.0 - *@weaverryan*
- [#966](https://github.com/symfony/webpack-encore/pull/966) - Upgrade to css-minimize-webpack-plugin 2.0 - *@stof*
- [#963](https://github.com/symfony/webpack-encore/pull/963) - feat: add Encore.when() - *@Kocal*

### Bug Fix

- [#943](https://github.com/symfony/webpack-encore/pull/943) - Do not allow webpack-dev-server to find an open port - *@weaverryan*

## [v1.1.2](https://github.com/symfony/webpack-encore/releases/tag/v1.1.2)

*March 1st, 2021*

### Bug Fix

- [#939](https://github.com/symfony/webpack-encore/pull/939) - fixing 2 issues related to webpack-dev-server and HMR - *@weaverryan*
- [#938](https://github.com/symfony/webpack-encore/pull/938) - Require vue-loader 15.9.5 to work with Encore 1.0 - *@weaverryan*

## [v1.1.1](https://github.com/symfony/webpack-encore/releases/tag/v1.1.1)

*February 19th, 2021*

### Bug Fix

- [#930](https://github.com/symfony/webpack-encore/pull/930) - Fix Encore.copyFiles() when copying images/fonts - *@Lyrkan*

## [v1.1.0](https://github.com/symfony/webpack-encore/releases/tag/v1.1.0)

*February 12th, 2021*

### Feature

- [#929](https://github.com/symfony/webpack-encore/pull/929) - Allowing stylus-loader 5 - *@weaverryan*
- [#928](https://github.com/symfony/webpack-encore/pull/928) - allowing sass-loader 11 - *@weaverryan*
- [#918](https://github.com/symfony/webpack-encore/pull/918) - Allowing new postcss-loader and less-loader - *@weaverryan*

## [v1.0.6](https://github.com/symfony/webpack-encore/releases/tag/v1.0.6)

*February 12th, 2021*

### Bug Fix

- [#921](https://github.com/symfony/webpack-encore/pull/921) - Fixing manifest paths (by temporarily embedding webpack-manifest-plugin fix) - *@weaverryan*

## [v1.0.5](https://github.com/symfony/webpack-encore/releases/tag/v1.0.5)

*February 6th, 2021*

### Bug Fix

- [#917](https://github.com/symfony/webpack-encore/pull/917) - Re-working dev-server and https detection - *@weaverryan*

## [v1.0.4](https://github.com/symfony/webpack-encore/releases/tag/v1.0.4)

*February 2nd, 2021*

### Bug Fix

- [#910](https://github.com/symfony/webpack-encore/pull/910) - Fix stimulus version bug - *@weaverryan*

## [v1.0.3](https://github.com/symfony/webpack-encore/releases/tag/v1.0.3)

*January 31st, 2021*

### Bug Fix

- [#905](https://github.com/symfony/webpack-encore/pull/905) - Omit cache key entirely when build cache is disabled - *@weaverryan*

## [v1.0.2](https://github.com/symfony/webpack-encore/releases/tag/v1.0.2)

*January 29th, 2021*

### Bug Fix

- [#902](https://github.com/symfony/webpack-encore/pull/902) - next stimulus-bridge will actually be 2.0 - *@weaverryan*
- [#901](https://github.com/symfony/webpack-encore/pull/901) - Working around missing manifest.json bug - *@weaverryan*

## [v1.0.1](https://github.com/symfony/webpack-encore/releases/tag/v1.0.1)

*January 29th, 2021*

### Bug Fix

- [#899](https://github.com/symfony/webpack-encore/pull/899) - Fixing support for webpack-dev-server v4 - *@weaverryan*

## [v1.0.0](https://github.com/symfony/webpack-encore/releases/tag/v1.0.0)

*January 27th, 2021*

### Feature

- [#892](https://github.com/symfony/webpack-encore/pull/892) - Prep for 1.0: upgrading all outdated dependencies - *@weaverryan*
- [#889](https://github.com/symfony/webpack-encore/pull/889) - bumping preset-env to version that depends on @babel/plugin-proposal-class-properties - *@weaverryan*
- [#888](https://github.com/symfony/webpack-encore/pull/888) - updating stimulus-bridge plugin to work with proposed new loader - *@weaverryan*
- [#887](https://github.com/symfony/webpack-encore/pull/887) - Bump less 4 and less loader 7 - *@VincentLanglet*
- [#884](https://github.com/symfony/webpack-encore/pull/884) - [Webpack 5] Adding new enableBuildCache() method for Webpack 5 persistent caching - *@weaverryan*
- [#883](https://github.com/symfony/webpack-encore/pull/883) - Updating images and fonts to use Webpack 5 Asset modules - *@weaverryan*
- [#878](https://github.com/symfony/webpack-encore/pull/878) - [Webpack5] Using old watchOptions regexp & removing Node 13 support - *@weaverryan*
- [#645](https://github.com/symfony/webpack-encore/pull/645) - Update Webpack to v5 (+ other dependencies) - *@Lyrkan*

## [v0.33.0](https://github.com/symfony/webpack-encore/releases/tag/v0.33.0)

*December 3rd, 2020*

### Feature

- [#870](https://github.com/symfony/webpack-encore/pull/870) - Prefer sass over node-sass - *@weaverryan*
- [#869](https://github.com/symfony/webpack-encore/pull/869) - Upgrade Vue3 deps beyond beta - *@weaverryan*
- [#865](https://github.com/symfony/webpack-encore/pull/865) - Bump sass-loader to ^10.0.0  - *@weaverryan*
- [#854](https://github.com/symfony/webpack-encore/pull/854) - Updates postcss loader to v4 - *@railto*
- [#831](https://github.com/symfony/webpack-encore/pull/831) - Validator should allow copyFiles() without other entries. - *@pszalko*
- [#800](https://github.com/symfony/webpack-encore/pull/800) - ⬆️ Upgraded ts-loader to ^8.0.1 - *@skmedix*
- [#774](https://github.com/symfony/webpack-encore/pull/774) - feat: add support for ESLint 7, drop support ESLint 5 - *@Kocal*
- [#756](https://github.com/symfony/webpack-encore/pull/756) - Add a boolean parameter to Encore.disableCssExtraction() - *@football2801*

## [v0.32.1](https://github.com/symfony/webpack-encore/releases/tag/v0.32.1)

*December 3rd, 2020*

### Bug Fix

- [#863](https://github.com/symfony/webpack-encore/pull/863) - fix(stimulus): don't require an optional dependency if it's not used - *@Kocal*

## [v0.32.0](https://github.com/symfony/webpack-encore/releases/tag/v0.32.0)

*December 3rd, 2020*

### Feature

- [#859](https://github.com/symfony/webpack-encore/pull/859) - Implement Stimulus bridge configurator - *@tgalopin*

## [v0.31.1](https://github.com/symfony/webpack-encore/releases/tag/v0.31.1)

*December 3rd, 2020*

### Bug Fix

- [#848](https://github.com/symfony/webpack-encore/pull/848) - Update resolve-url-loader to fix prototype pollution - *@Khartir*

## [v0.31.0](https://github.com/symfony/webpack-encore/releases/tag/v0.31.0)

*September 10th, 2020*

### Bug Fix

- [#832](https://github.com/symfony/webpack-encore/pull/832) - Update assets-webpack-plugin to ^5.1.1 - *@cilefen*

## [v0.30.2](https://github.com/symfony/webpack-encore/releases/tag/v0.30.2)

*May 14th, 2020*

### Bug Fix

- [#772](https://github.com/symfony/webpack-encore/pull/772) - Setting CleanWebpackPlugin's cleanStaleWebpackAssets: false - *@weaverryan*

## [v0.30.1](https://github.com/symfony/webpack-encore/releases/tag/v0.30.1)

*May 13th, 2020*

### Bug Fix

- [#769](https://github.com/symfony/webpack-encore/pull/769) - Reverting change to only package vue runtime loader - *@weaverryan*

## [v0.30.0](https://github.com/symfony/webpack-encore/releases/tag/v0.30.0)

*May 11th, 2020*

### Feature

- [#763](https://github.com/symfony/webpack-encore/pull/763) - Removing vue2 alias to use the full build - *@weaverryan*
- [#760](https://github.com/symfony/webpack-encore/pull/760) - upgrading to clean-webpack-plugin 3.0 - *@weaverryan*
- [#759](https://github.com/symfony/webpack-encore/pull/759) - upgrading fork-ts-checker-webpack-plugin to test 4.0 - *@weaverryan*
- [#758](https://github.com/symfony/webpack-encore/pull/758) - Feat/sass loader 8 - *@weaverryan*
- [#746](https://github.com/symfony/webpack-encore/pull/746) - Added Vue3 support - *@weaverryan*

### Bug Fix

- [#765](https://github.com/symfony/webpack-encore/pull/765) - Fixing babel.config.js filename in message - *@weaverryan*
- [#752](https://github.com/symfony/webpack-encore/pull/752) - Upgrade yargs-parser - *@stof*
- [#739](https://github.com/symfony/webpack-encore/pull/739) - Resolve loaders directly from Encore instead of using their names - *@Lyrkan*
- [#738](https://github.com/symfony/webpack-encore/pull/738) - Fix babel config file detection - *@jdreesen*

## [v0.29.1](https://github.com/symfony/webpack-encore/releases/tag/v0.29.1)

*April 18th, 2020*

### Bug Fix

- [#732](https://github.com/symfony/webpack-encore/pull/732) - feat: add ESLint 6 support - *@Kocal*

## [v0.29.0](https://github.com/symfony/webpack-encore/releases/tag/v0.29.0)

*April 17th, 2020*

### Feature

- [#731](https://github.com/symfony/webpack-encore/pull/731) - Upgrade file-loader and allowed version for url-loader, drop Node 8 support - *@weaverryan*
- [#729](https://github.com/symfony/webpack-encore/pull/729) - bumping to css-loader v3 - *@weaverryan*
- [#718](https://github.com/symfony/webpack-encore/pull/718) - Include the .pcss extension for PostCSS files - *@opdavies*
- [#715](https://github.com/symfony/webpack-encore/pull/715) - Added the possibility to configure the StyleLoader via the method Enc… - *@tooltonix*
- [#710](https://github.com/symfony/webpack-encore/pull/710) - bump: style-loader version 1.X - *@Grafikart*
- [#694](https://github.com/symfony/webpack-encore/pull/694) - Add Encore.enableBabelTypeScriptPreset() to "compile" TypeScript with Babel - *@Kocal*
- [#693](https://github.com/symfony/webpack-encore/pull/693) - Add a way to configure devServer options - *@Kocal*
- [#687](https://github.com/symfony/webpack-encore/pull/687) - Remove ESLint user-related config - *@Kocal*
- [#680](https://github.com/symfony/webpack-encore/pull/680) - Add Encore.addCacheGroup() method and depreciate Encore.createSharedEntry() - *@Lyrkan*
- [#574](https://github.com/symfony/webpack-encore/pull/574) - Proposal to replace #504 (ESLint/Vue) - *@Kocal*

### Bug Fix

- [#649](https://github.com/symfony/webpack-encore/pull/649) - Allow to use the [N] placeholder in copyFiles() - *@Lyrkan*

## [v0.28.3](https://github.com/symfony/webpack-encore/releases/tag/v0.28.3)

*February 24th, 2020*

### Bug Fix

- [#697](https://github.com/symfony/webpack-encore/pull/697) - Fix source maps being generated by default in dev - *@Lyrkan*


## 0.28.0

 * Don't make `@babel/preset-env` use `forceAllTransforms` option
   in production - this will reduce build size in production
   for environments that only need to support more modern
   browsers - #612 thanks to @Lyrkan.

 * Added support with `enablePostCssLoader()` to process files
   ending in `.postcss` or using `lang="postcss"` in Vue - #594
   thanks to @Lyrkan.

 * Allow `resolve-url-loader` to be configured via `enableSassLoader()` -
   #603 thanks to @diegocardoso93.

 * Support was removed from Node 9 (a no-longer-supported version
   of Node) - #585 thanks to @weaverryan

 * [BC Break] Removed the ability to use `[chunkhash]` in
   `configureFilenames()`, which was already deprecated and
   no longer reliable - #608 thanks to @Lyrkan.

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

