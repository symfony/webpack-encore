/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const WebpackConfig = require('./lib/WebpackConfig');
const configGenerator = require('./lib/config-generator');
const validator = require('./lib/config/validator');
const PrettyError = require('pretty-error');
const logger = require('./lib/logger');
const parseRuntime = require('./lib/config/parse-runtime');
const chalk = require('chalk');
const levenshtein = require('fast-levenshtein');
const fs = require('fs');
const path = require('path');

let webpackConfig = null;
let runtimeConfig = require('./lib/context').runtimeConfig;

function initializeWebpackConfig() {
    if (runtimeConfig.verbose) {
        logger.verbose();
    }

    // Display a warning if webpack is listed as a [dev-]dependency
    try {
        const packageInfo = JSON.parse(
            fs.readFileSync(path.resolve(runtimeConfig.context, 'package.json'))
        );

        if (packageInfo) {
            const dependencies = new Set([
                ...(packageInfo.dependencies ? Object.keys(packageInfo.dependencies) : []),
                ...(packageInfo.devDependencies ? Object.keys(packageInfo.devDependencies) : []),
            ]);

            if (dependencies.has('webpack')) {
                logger.warning('Webpack is already provided by Webpack Encore, also adding it to your package.json file may cause issues.');
            }
        }
    } catch (e) {
        logger.warning('Could not read package.json file.');
    }

    webpackConfig = new WebpackConfig(runtimeConfig);
}

// If runtimeConfig is already set webpackConfig can directly
// be initialized here.
if (runtimeConfig) {
    initializeWebpackConfig();
}

class Encore {
    /**
     * The directory where your files should be output.
     *
     * If relative (e.g. web/build), it will be set relative
     * to the directory where your package.json lives.
     *
     * @param {string} outputPath
     * @returns {Encore}
     */
    setOutputPath(outputPath) {
        webpackConfig.setOutputPath(outputPath);

        return this;
    }

    /**
     * The public version of outputPath: the public path to outputPath.
     *
     * For example, if "web" is your document root, then:
     *      .setOutputPath('web/build')
     *      .setPublicPath('/build')
     *
     * This can also be set to an absolute URL if you're using
     * a CDN: publicPath is used as the prefix to all asset paths
     * in the manifest.json file and internally in webpack:
     *      .setOutputPath('web/build')
     *      .setPublicPath('https://coolcdn.com')
     *      // needed when public path is absolute
     *      .setManifestKeyPrefix('/build')
     *
     * @param {string} publicPath
     * @returns {Encore}
     */
    setPublicPath(publicPath) {
        webpackConfig.setPublicPath(publicPath);

        return this;
    }

    /**
     * Used as a prefix to the *keys* in manifest.json. Not usually needed.
     *
     * You don't normally need to set this. When you *do* need to set
     * it, an error will notify you.
     *
     * Typically, publicPath is used in the keys inside manifest.json.
     * But if publicPath is absolute, then we require you to set this.
     * For example:
     *
     *      .setOutputPath('web/build')
     *      .setPublicPath('https://coolcdn.com/FOO')
     *      .setManifestKeyPrefix('build/')
     *
     * The manifest.json file would look something like this:
     *
     *      {
     *          "build/main.js": "https://coolcdn.com/FOO/main.a54f3ccd2.js"
     *      }
     *
     * @param {string} manifestKeyPrefix
     * @returns {Encore}
     */
    setManifestKeyPrefix(manifestKeyPrefix) {
        webpackConfig.setManifestKeyPrefix(manifestKeyPrefix);

        return this;
    }

    /**
     * Allows you to configure the options passed to the DefinePlugin.
     * A list of available options can be found at https://webpack.js.org/plugins/define-plugin/
     *
     * For example:
     *
     *      Encore.configureDefinePlugin((options) => {
     *          options.VERSION = JSON.stringify('1.0.0');
     *      })
     *
     * @param {function} definePluginOptionsCallback
     * @returns {Encore}
     */
    configureDefinePlugin(definePluginOptionsCallback = () => {}) {
        webpackConfig.configureDefinePlugin(definePluginOptionsCallback);

        return this;
    }

    /**
     * Allows you to configure the options passed to the friendly-errors-webpack-plugin.
     * A list of available options can be found at https://github.com/geowarin/friendly-errors-webpack-plugin
     *
     * For example:
     *
     *      Encore.configureFriendlyErrorsPlugin((options) => {
     *          options.clearConsole = true;
     *      })
     *
     * @param {function} friendlyErrorsPluginOptionsCallback
     * @returns {Encore}
     */
    configureFriendlyErrorsPlugin(friendlyErrorsPluginOptionsCallback = () => {}) {
        webpackConfig.configureFriendlyErrorsPlugin(friendlyErrorsPluginOptionsCallback);

        return this;
    }

    /**
     * Allows you to configure the options passed to the LoaderOptionsPlugins.
     * A list of available options can be found at https://webpack.js.org/plugins/loader-options-plugin/
     *
     * For example:
     *
     *      Encore.configureLoaderOptionsPlugin((options) => {
     *          options.minimize = true;
     *      })
     *
     * @param {function} loaderOptionsPluginOptionsCallback
     * @returns {Encore}
     */
    configureLoaderOptionsPlugin(loaderOptionsPluginOptionsCallback = () => {}) {
        webpackConfig.configureLoaderOptionsPlugin(loaderOptionsPluginOptionsCallback);

        return this;
    }

    /**
     * Allows you to configure the options passed to webpack-manifest-plugin.
     * A list of available options can be found at https://github.com/danethurber/webpack-manifest-plugin
     *
     * For example:
     *
     *      Encore.configureManifestPlugin((options) => {
     *          options.fileName = '../../var/assets/manifest.json';
     *      })
     *
     * @param {function} manifestPluginOptionsCallback
     * @returns {Encore}
     */
    configureManifestPlugin(manifestPluginOptionsCallback = () => {}) {
        webpackConfig.configureManifestPlugin(manifestPluginOptionsCallback);

        return this;
    }

    /**
     * Allows you to configure the options passed to the terser-webpack-plugin.
     * A list of available options can be found at https://github.com/webpack-contrib/terser-webpack-plugin
     *
     * For example:
     *
     *      Encore.configureTerserPlugin((options) => {
     *          options.cache = true;
     *          options.terserOptions = {
     *              output: {
     *                  comments: false
     *              }
     *          }
     *      })
     *
     * @param {function} terserPluginOptionsCallback
     * @returns {Encore}
     */
    configureTerserPlugin(terserPluginOptionsCallback = () => {}) {
        webpackConfig.configureTerserPlugin(terserPluginOptionsCallback);

        return this;
    }

    /**
     * Allows you to configure the options passed to the optimize-css-assets-webpack-plugin.
     * A list of available options can be found at https://github.com/NMFR/optimize-css-assets-webpack-plugin
     *
     * For example:
     *
     *      Encore.configureOptimizeCssPlugin((options) => {
     *          options.cssProcessor = require('cssnano');
     *          options.cssProcessorPluginOptions = {
     *              preset: ['default', { discardComments: { removeAll: true } }],
     *          }
     *      })
     *
     * @param {function} optimizeCssPluginOptionsCallback
     * @returns {Encore}
     */
    configureOptimizeCssPlugin(optimizeCssPluginOptionsCallback = () => {}) {
        webpackConfig.configureOptimizeCssPlugin(optimizeCssPluginOptionsCallback);

        return this;
    }

    /**
     * Adds a JavaScript file that should be webpacked:
     *
     *      // final output file will be main.js in the output directory
     *      Encore.addEntry('main', './path/to/some_file.js');
     *
     * If the JavaScript file imports/requires CSS/Sass/LESS files,
     * then a CSS file (e.g. main.css) will also be output.
     *
     * @param {string} name       The name (without extension) that will be used
     *                            as the output filename (e.g. app will become app.js)
     *                            in the output directory.
     * @param {string|Array} src  The path to the source file (or files)
     * @returns {Encore}
     */
    addEntry(name, src) {
        webpackConfig.addEntry(name, src);

        return this;
    }

    /**
     * Adds a CSS/SASS/LESS file that should be webpacked:
     *
     *      // final output file will be main.css in the output directory
     *      Encore.addEntry('main', './path/to/some_file.css');
     *
     * This is actually not something Webpack does natively, and you
     * should avoid using this function when possible. A better option
     * is to use addEntry() and then require/import your CSS files from
     * within your JavaScript files.
     *
     * @param {string} name       The name (without extension) that will be used
     *                            as the output filename (e.g. app will become app.css)
     *                            in the output directory.
     * @param {string|Array} src  The path to the source file (or files)
     * @returns {Encore}
     */
    addStyleEntry(name, src) {
        webpackConfig.addStyleEntry(name, src);

        return this;
    }

    /**
     * Add a plugin to the sets of plugins already registered by Encore
     *
     * For example, if you want to add the "webpack.IgnorePlugin()", then:
     *      .addPlugin(new webpack.IgnorePlugin(requestRegExp, contextRegExp))
     *
     * By default custom plugins are added after the ones managed by Encore
     * but you can also set a priority to define where your plugin will be
     * added in the generated Webpack config.
     *
     * For example, if a plugin has a priority of 0 and you want to add
     * another plugin after it, then:
     *
     *      .addPlugin(new MyWebpackPlugin(), -10)
     *
     * The priority of each plugin added by Encore can be found in the
     * "lib/plugins/plugin-priorities.js" file. It is recommended to use
     * these constants if you want to add a plugin using the same priority
     * as one managed by Encore in order to avoid backward compatibility
     * breaks.
     *
     * For example, if you want one of your plugins to have the same priority
     * than the DefinePlugin:
     *
     *      const Encore = require('@symfony/webpack-encore');
     *      const PluginPriorities = require('@symfony/webpack-encore/lib/plugins/plugin-priorities.js');
     *
     *      Encore.addPlugin(new MyWebpackPlugin(), PluginPriorities.DefinePlugin);
     *
     * @param {object} plugin
     * @param {number} priority
     * @returns {Encore}
     */
    addPlugin(plugin, priority = 0) {
        webpackConfig.addPlugin(plugin, priority);

        return this;
    }

    /**
     * Adds a custom loader config
     *
     * @param {object} loader The loader config object
     *
     * @returns {Encore}
     */
    addLoader(loader) {
        webpackConfig.addLoader(loader);

        return this;
    }

    /**
     * Alias to addLoader
     *
     * @param {object} rule
     *
     * @returns {Encore}
     */
    addRule(rule) {
        this.addLoader(rule);

        return this;
    }

    /**
     * Allow you to add aliases that will be used by
     * Webpack when trying to resolve modules.
     *
     * See https://webpack.js.org/configuration/resolve/#resolve-alias
     *
     * For example:
     *
     *      Encore.addAliases({
     *          Utilities: path.resolve(__dirname, 'src/utilities/'),
     *          Templates: path.resolve(__dirname, 'src/templates/')
     *      })
     *
     * @param {object} aliases
     *
     * @returns {Encore}
     */
    addAliases(aliases) {
        webpackConfig.addAliases(aliases);

        return this;
    }

    /**
     * Allow you to exclude some dependencies from the output bundles.
     *
     * See https://webpack.js.org/configuration/externals/
     *
     * For example:
     *
     *      Encore.addExternals({
     *          jquery: 'jQuery',
     *          react: 'react'
     *      })
     *
     * @param {object} externals
     *
     * @returns {Encore}
     */
    addExternals(externals) {
        webpackConfig.addExternals(externals);

        return this;
    }

    /**
     * When enabled, files are rendered with a hash based
     * on their contents (e.g. main.a2b61cc.js)
     *
     * A manifest.json file will be rendered to the output
     * directory with a map from the original file path to
     * the versioned path (e.g. `builds/main.js` => `builds/main.a2b61cc.js`)
     *
     * @param {boolean} enabled
     * @returns {Encore}
     */
    enableVersioning(enabled = true) {
        webpackConfig.enableVersioning(enabled);

        return this;
    }

    /**
     * When enabled, all final CSS and JS files will be rendered
     * with sourcemaps to help debugging.
     *
     * The *type* of source map will differ between a development
     * or production build.
     *
     * @param {boolean} enabled
     * @returns {Encore}
     */
    enableSourceMaps(enabled = true) {
        webpackConfig.enableSourceMaps(enabled);

        return this;
    }

    /**
     * Add a "commons" file that holds JS shared by multiple chunks/files.
     *
     * @param {string} name The chunk name (e.g. vendor to create a vendor.js)
     * @param {string} file A file whose code & imports should be put into the shared file.
     * @returns {Encore}
     */
    createSharedEntry(name, file) {
        webpackConfig.createSharedEntry(name, file);

        return this;
    }

    /**
     * Copy files or folders to the build directory.
     *
     * For example:
     *
     *      // Copy the content of a whole directory and its subdirectories
     *      Encore.copyFiles({ from: './assets/images' });
     *
     *      // Only copy files matching a given pattern
     *      Encore.copyFiles({ from: './assets/images', pattern: /\.(png|jpg|jpeg)$/ })
     *
     *      // Set the path the files are copied to
     *      Encore.copyFiles({
     *          from: './assets/images',
     *          pattern: /\.(png|jpg|jpeg)$/,
     *          // to path is relative to the build directory
     *          to: 'images/[path][name].[ext]'
     *      })
     *
     *      // Version files
     *      Encore.copyFiles({
     *          from: './assets/images',
     *          to: 'images/[path][name].[hash:8].[ext]'
     *      })
     *
     *      // Add multiple configs in a single call
     *      Encore.copyFiles([
     *          { from: './assets/images' },
     *          { from: './txt', pattern: /\.txt$/ },
     *      ]);
     *
     * Notes:
     *      * No transformation is applied to the copied files (for instance
     *        copying a CSS file won't minify it)
     *
     * Supported options:
     *      * {string} from (mandatory)
     *              The path of the source directory (mandatory)
     *      * {RegExp} pattern (default: all files)
     *              A pattern that the filenames must match in order to be copied
     *      * {string} to (default: [path][name].[ext])
     *              Where the files must be copied to. You can add all the
     *              placeholders supported by the file-loader.
     *              https://github.com/webpack-contrib/file-loader#placeholders
     *      * {boolean} includeSubdirectories (default: true)
     *              Whether or not the copy should include subdirectories.
     *
     * @param {object|Array} configs
     * @returns {Encore}
     */
    copyFiles(configs) {
        webpackConfig.copyFiles(configs);

        return this;
    }

    /**
     * Tell Webpack to output a separate runtime.js file.
     *
     * This file must be included via a script tag before all
     * other JavaScript files output by Encore.
     *
     * The runtime.js file is useful when you plan to include
     * multiple entry files on the same page (e.g. a layout.js entry
     * and a page-specific entry). If you are *not* including
     * multiple entries on the same page, you can safely disable
     * this - disableSingleRuntimeChunk() - and remove the extra script tags.
     *
     * If you *do* include multiple entry files on the same page,
     * disabling the runtime.js file has two important consequences:
     *  A) Each entry file will contain the Webpack runtime, which
     *     means each contains some code that is duplicated in the other.
     *  B) If two entry files require the same module (e.g. jquery),
     *     they will receive *different* objects - not the *same* object.
     *     This can cause some confusion if you expect a "layout.js" entry
     *     to be able to "initialize" some jQuery plugins, because the
     *     jQuery required by the other entry will be a different instance,
     *     and so won't have the plugins initialized on it.
     *
     * @returns {Encore}
     */
    enableSingleRuntimeChunk() {
        webpackConfig.enableSingleRuntimeChunk();

        return this;
    }

    /**
     * Tell Webpack to *not* output a separate runtime.js file.
     *
     * See enableSingleRuntimeChunk() for more details.
     *
     * @returns {Encore}
     */
    disableSingleRuntimeChunk() {
        webpackConfig.disableSingleRuntimeChunk();

        return this;
    }

    /**
     * Tell Webpack to "split" your entry chunks.
     *
     * This will mean that, instead of adding 1 script tag
     * to your page, your server-side code will need to read
     * the entrypoints.json file in the build directory to
     * determine the *multiple* .js (and .css) files that
     * should be included for each entry.
     *
     * This is a performance optimization, but requires extra
     * work (described above) to support this.
     *
     * @returns {Encore}
     */
    splitEntryChunks() {
        webpackConfig.splitEntryChunks();

        return this;
    }

    /**
     * Configure the optimization.splitChunks configuration.
     *
     * https://webpack.js.org/plugins/split-chunks-plugin/
     *
     * Encore.configureSplitChunks(function(splitChunks) {
     *      // change the configuration
     *
     *      splitChunks.minSize = 0;
     * });
     *
     * @param {function} callback
     * @returns {Encore}
     */
    configureSplitChunks(callback) {
        webpackConfig.configureSplitChunks(callback);

        return this;
    }

    /**
     * Automatically make some variables available everywhere!
     *
     * Usage:
     *
     *  WebpackConfig.autoProvideVariables({
     *      $: 'jquery',
     *      jQuery: 'jquery'
     *  });
     *
     *  Then, whenever $ or jQuery are found in any
     *  modules, webpack will automatically require
     *  the "jquery" module so that the variable is available.
     *
     *  This is useful for older packages, that might
     *  expect jQuery (or something else) to be a global variable.
     *
     * @param {object} variables
     * @returns {Encore}
     */
    autoProvideVariables(variables) {
        webpackConfig.autoProvideVariables(variables);

        return this;
    }

    /**
     * Makes jQuery available everywhere. Equivalent to
     *
     *  WebpackConfig.autoProvideVariables({
     *      $: 'jquery',
     *      jQuery: 'jquery'
     *  });
     *
     * @returns {Encore}
     */
    autoProvidejQuery() {
        webpackConfig.autoProvidejQuery();

        return this;
    }

    /**
     * Enables the postcss-loader
     *
     * Once enabled, you must have a postcss.config.js config file.
     *
     * https://github.com/postcss/postcss-loader
     *
     *     Encore.enablePostCssLoader();
     *
     * Or pass options to the loader
     *
     *     Encore.enablePostCssLoader(function(options) {
     *         // https://github.com/postcss/postcss-loader#options
     *         // options.config = {...}
     *     })
     *
     * @param {function} postCssLoaderOptionsCallback
     * @returns {Encore}
     */
    enablePostCssLoader(postCssLoaderOptionsCallback = () => {}) {
        webpackConfig.enablePostCssLoader(postCssLoaderOptionsCallback);

        return this;
    }

    /**
     * Call this if you plan on loading SASS files.
     *
     *     Encore.enableSassLoader();
     *
     * Or pass options to node-sass
     *
     *     Encore.enableSassLoader(function(options) {
     *         // https://github.com/sass/node-sass#options
     *         // options.includePaths = [...]
     *     }, {
     *         // set optional Encore-specific options
     *         // resolveUrlLoader: true
     *     });
     *
     * Supported options:
     *      * {bool} resolveUrlLoader (default=true)
     *              Whether or not to use the resolve-url-loader.
     *              Setting to false can increase performance in some
     *              cases, especially when using bootstrap_sass. But,
     *              when disabled, all url()'s are resolved relative
     *              to the original entry file... not whatever file
     *              the url() appears in.
     *
     * @param {function} sassLoaderOptionsCallback
     * @param {object} encoreOptions
     * @returns {Encore}
     */
    enableSassLoader(sassLoaderOptionsCallback = () => {}, encoreOptions = {}) {
        webpackConfig.enableSassLoader(sassLoaderOptionsCallback, encoreOptions);

        return this;
    }

    /**
     * Call this if you plan on loading less files.
     *
     *     Encore.enableLessLoader();
     *
     * Or pass options to the loader
     *
     *     Encore.enableLessLoader(function(options) {
     *         // https://github.com/webpack-contrib/less-loader#examples
     *         // http://lesscss.org/usage/#command-line-usage-options
     *         // options.relativeUrls = false;
     *     });
     *
     * @param {function} lessLoaderOptionsCallback
     * @returns {Encore}
     */
    enableLessLoader(lessLoaderOptionsCallback = () => {}) {
        webpackConfig.enableLessLoader(lessLoaderOptionsCallback);

        return this;
    }

    /**
     * Call this if you plan on loading stylus files.
     *
     *     Encore.enableStylusLoader();
     *
     * Or pass options to the loader
     *
     *     Encore.enableStylusLoader(function(options) {
     *         // https://github.com/shama/stylus-loader
     *         // options.import = ['~library/index.styl'];
     *     });
     *
     * @param {function} stylusLoaderOptionsCallback
     * @returns {Encore}
     */
    enableStylusLoader(stylusLoaderOptionsCallback = () => {}) {
        webpackConfig.enableStylusLoader(stylusLoaderOptionsCallback);

        return this;
    }

    /**
     * Configure babel, without needing a .babelrc file.
     *
     * https://babeljs.io/docs/usage/babelrc/
     *
     * Encore.configureBabel(function(babelConfig) {
     *      // change the babelConfig
     * }, {
     *      // set optional Encore-specific options, for instance:
     *
     *      // change the rule that determines which files
     *      // won't be processed by Babel
     *      exclude: /bower_components/
     *
     *      // ...or keep the default rule but only allow
     *      // *some* Node modules to be processed by Babel
     *      include_node_modules: ['foundation-sites']
     * });
     *
     * Supported options:
     *      * {Condition} exclude (default=/(node_modules|bower_components)/)
     *              A Webpack Condition passed to the JS/JSX rule that
     *              determines which files and folders should not be
     *              processed by Babel (https://webpack.js.org/configuration/module/#condition).
     *              Cannot be used if the "include_node_modules" option is
     *              also set.
     *      * {string[]} include_node_modules
     *              If set that option will include the given Node modules to
     *              the files that are processed by Babel. Cannot be used if
     *              the "exclude" option is also set.
     *
     * @param {function} callback
     * @param {object} encoreOptions
     * @returns {Encore}
     */
    configureBabel(callback, encoreOptions = {}) {
        webpackConfig.configureBabel(callback, encoreOptions);

        return this;
    }

    /**
     * Configure the css-loader.
     *
     * https://github.com/webpack-contrib/css-loader#options
     *
     * Encore.configureCssLoader(function(config) {
     *      // change the config
     *      // config.minimize = true;
     * });
     *
     * @param {function} callback
     * @returns {Encore}
     */
    configureCssLoader(callback) {
        webpackConfig.configureCssLoader(callback);

        return this;
    }

    /**
     * If enabled, the react preset is added to Babel.
     *
     * https://babeljs.io/docs/plugins/preset-react/
     *
     * @returns {Encore}
     */
    enableReactPreset() {
        webpackConfig.enableReactPreset();

        return this;
    }

    /**
     * If enabled, a Preact preset will be applied to
     * the generated Webpack configuration.
     *
     *     Encore.enablePreactPreset()
     *
     * If you wish to also use preact-compat (https://github.com/developit/preact-compat)
     * you can enable it by setting the "preactCompat" option to true:
     *
     *     Encore.enablePreactPreset({ preactCompat: true })
     *
     * @param {object} options
     * @returns {Encore}
     */
    enablePreactPreset(options = {}) {
        webpackConfig.enablePreactPreset(options);

        return this;
    }

    /**
     * Call this if you plan on loading TypeScript files.
     *
     * Encore.enableTypeScriptLoader()
     *
     * Or, configure the ts-loader options:
     *
     * Encore.enableTypeScriptLoader(function(tsConfig) {
     *      // https://github.com/TypeStrong/ts-loader/blob/master/README.md#loader-options
     *      // tsConfig.silent = false;
     * });
     *
     * @param {function} callback
     * @returns {Encore}
     */
    enableTypeScriptLoader(callback = () => {}) {
        webpackConfig.enableTypeScriptLoader(callback);

        return this;
    }

    /**
     * Call this to enable forked type checking for TypeScript loader
     * https://github.com/TypeStrong/ts-loader/blob/v2.3.0/README.md#faster-builds
     *
     * This is a build optimization API to reduce build times.
     *
     * @param {function} forkedTypeScriptTypesCheckOptionsCallback
     * @returns {Encore}
     */
    enableForkedTypeScriptTypesChecking(forkedTypeScriptTypesCheckOptionsCallback = () => {}) {
        webpackConfig.enableForkedTypeScriptTypesChecking(
            forkedTypeScriptTypesCheckOptionsCallback
        );

        return this;
    }

    /**
     * If enabled, the Vue.js loader is enabled.
     *
     * https://github.com/vuejs/vue-loader
     *
     *     Encore.enableVueLoader();
     *
     *     // or configure the vue-loader options
     *     // https://vue-loader.vuejs.org/en/configurations/advanced.html
     *     Encore.enableVueLoader(function(options) {
     *          options.preLoaders = { ... }
     *     });
     *
     * @param {function} vueLoaderOptionsCallback
     * @returns {Encore}
     */
    enableVueLoader(vueLoaderOptionsCallback = () => {}) {
        webpackConfig.enableVueLoader(vueLoaderOptionsCallback);

        return this;
    }

    /**
     * If enabled, the eslint-loader is enabled.
     *
     * https://github.com/MoOx/eslint-loader
     *
     *     // enables the eslint loaded using the default eslint configuration.
     *     Encore.enableEslintLoader();
     *
     *     // Optionally, you can pass in the configuration eslint should extend.
     *     Encore.enableEslintLoader('airbnb');
     *
     *     // You can also pass in an object of options
     *     // that will be passed on to the eslint-loader
     *     Encore.enableEslintLoader({
     *         extends: 'airbnb',
               emitWarning: false
     *     });
     *
     *     // For a more advanced usage you can pass in a callback
     *     // https://github.com/MoOx/eslint-loader#options
     *     Encore.enableEslintLoader((options) => {
     *          options.extends = 'airbnb';
     *          options.emitWarning = false;
     *     });
     *
     * @param {string|object|function} eslintLoaderOptionsOrCallback
     * @returns {Encore}
     */
    enableEslintLoader(eslintLoaderOptionsOrCallback = () => {}) {
        webpackConfig.enableEslintLoader(eslintLoaderOptionsOrCallback);

        return this;
    }

    /**
     * If enabled, display build notifications using
     * webpack-notifier.
     *
     * https://github.com/Turbo87/webpack-notifier
     *
     *     Encore.enableBuildNotifications();
     *
     *     // or configure the webpack-notifier options
     *     // https://github.com/Turbo87/webpack-notifier#configuration
     *     Encore.enableBuildNotifications(true, function(options) {
     *         options.title = 'Webpack build';
     *     });
     *
     * @param {boolean} enabled
     * @param {function} notifierPluginOptionsCallback
     * @returns {Encore}
     */
    enableBuildNotifications(enabled = true, notifierPluginOptionsCallback = () => {}) {
        webpackConfig.enableBuildNotifications(enabled, notifierPluginOptionsCallback);

        return this;
    }

    /**
     * Call this if you plan on loading Handlebars files.
     *
     *     Encore.enableHandlebarsLoader();
     *
     * Or pass options to the loader
     *
     *     Encore.enableHandlebarsLoader(function(options) {
     *         // https://github.com/pcardune/handlebars-loader
     *         // options.debug = true;
     *     });
     *
     * @param {function} callback
     * @returns {Encore}
     */
    enableHandlebarsLoader(callback = () => {}) {
        webpackConfig.enableHandlebarsLoader(callback);

        return this;
    }

    /**
     * Call this if you wish to disable the default
     * images loader.
     *
     * @returns {Encore}
     */
    disableImagesLoader() {
        webpackConfig.disableImagesLoader();

        return this;
    }

    /**
     * Call this if you wish to disable the default
     * fonts loader.
     *
     * @returns {Encore}
     */
    disableFontsLoader() {
        webpackConfig.disableFontsLoader();

        return this;
    }

    /**
     * Call this to change how the name of each output
     * file is generated.
     *
     *     Encore.configureFilenames({
     *         js: '[name].[contenthash].js',
     *         css: '[name].[contenthash].css',
     *         images: 'images/[name].[hash:8].[ext]',
     *         fonts: 'fonts/[name].[hash:8].[ext]'
     *     });
     *
     * It's safe to omit a key (e.g. css): the default naming strategy
     * will be used for any file types not passed.
     *
     * If you are using Encore.enableVersioning()
     * make sure that your "js" and "css" filenames contain
     * "[contenthash]".
     *
     * @param {object} filenames
     * @returns {Encore}
     */
    configureFilenames(filenames) {
        webpackConfig.configureFilenames(filenames);

        return this;
    }

    /**
     * Allows to configure the URL loader.
     *
     * https://github.com/webpack-contrib/url-loader
     *
     *     Encore.configureUrlLoader({
     *         images: {
     *             limit: 8192,
     *             mimetype: 'image/png'
     *         },
     *         fonts: {
     *             limit: 4096
     *         }
     *     });
     *
     * If a key (e.g. fonts) doesn't exists or contains a
     * falsy value the file-loader will be used instead.
     *
     * @param {object} urlLoaderOptions
     * @return {Encore}
     */
    configureUrlLoader(urlLoaderOptions = {}) {
        webpackConfig.configureUrlLoader(urlLoaderOptions);

        return this;
    }

    /**
     * If enabled, the output directory is emptied between each build (to remove old files).
     *
     * A list of available options can be found at https://github.com/johnagan/clean-webpack-plugin
     *
     * For example:
     *
     *      Encore.cleanupOutputBeforeBuild(['*.js'], (options) => {
     *          options.dry = true;
     *      })
     *
     * @param {Array} paths Paths that should be cleaned, relative to the "root" option
     * @param {function} cleanWebpackPluginOptionsCallback
     * @returns {Encore}
     */
    cleanupOutputBeforeBuild(paths = ['**/*'], cleanWebpackPluginOptionsCallback = () => {}) {
        webpackConfig.cleanupOutputBeforeBuild(paths, cleanWebpackPluginOptionsCallback);

        return this;
    }

    /**
     * Is this currently a "production" build?
     *
     * @returns {boolean}
     */
    isProduction() {
        return webpackConfig.isProduction();
    }

    /**
     * Use this at the bottom of your webpack.config.js file:
     *
     * module.exports = Encore.getWebpackConfig();
     *
     * @returns {*}
     */
    getWebpackConfig() {
        validator(webpackConfig);

        return configGenerator(webpackConfig);
    }

    /**
     * Resets the Encore state to allow building a new config.
     *
     * getWebpackConfig should be used before resetting to build
     * a config for the existing state.
     *
     * @returns {void}
     */
    reset() {
        webpackConfig = new WebpackConfig(runtimeConfig);
    }

    /**
     * Initialize the runtime environment.
     *
     * This can be used to configure the Encore runtime if you're
     * using Encore without executing the "./node_module/.bin/encore"
     * utility (e.g. with karma-webpack).
     *
     * Encore.configureRuntimeEnvironment(
     *     // Environment to use (dev, dev-server, production)
     *     'dev-server',
     *
     *     // Same options you would use with the
     *     // CLI utility with their name in
     *     // camelCase.
     *     {
     *         https: true,
     *         keepPublicPath: true
     *     }
     * )
     *
     * Be aware than using this method will also reset the current
     * webpack configuration.
     *
     * @param {string} environment
     * @param {object} options
     * @returns {Encore}
     */
    configureRuntimeEnvironment(environment, options = {}) {
        runtimeConfig = parseRuntime(
            Object.assign(
                {},
                require('yargs/yargs')([environment]).argv,
                options
            ),
            process.cwd()
        );

        initializeWebpackConfig();

        return this;
    }

    /**
     * Clear the runtime environment.
     *
     * Be aware than using this method will also reset the
     * current webpack configuration.
     *
     * @returns {void}
     */
    clearRuntimeEnvironment() {
        runtimeConfig = null;
        webpackConfig = null;
    }

    /**
     * @deprecated
     * @return {void}
     */
    configureExtractTextPlugin() {
        throw new Error('The configureExtractTextPlugin() method was removed from Encore. The underlying plugin was removed from Webpack 4.');
    }

    /**
     * @deprecated
     * @return {void}
     */
    enableCoffeeScriptLoader() {
        throw new Error('The enableCoffeeScriptLoader() method and CoffeeScript support was removed from Encore due to support problems with Webpack 4. If you are interested in this feature, please submit a pull request!');
    }

    /**
     * @deprecated
     * @return {void}
     */
    configureUglifyJsPlugin() {
        throw new Error('The configureUglifyJsPlugin() method was removed from Encore due to uglify-js dropping ES6+ support in its latest version. Please use configureTerserPlugin() instead.');
    }
}

// Proxy the API in order to prevent calls to most of its methods
// if the webpackConfig object hasn't been initialized yet.
const EncoreProxy = new Proxy(new Encore(), {
    get: (target, prop) => {
        if (prop === '__esModule') {
            // When using Babel to preprocess a webpack.config.babel.js file
            // (for instance if we want to use ES6 syntax) the __esModule
            // property needs to be whitelisted to avoid an "Unknown property"
            // error.
            return target[prop];
        }

        if (typeof target[prop] === 'function') {
            // These methods of the public API can be called even if the
            // webpackConfig object hasn't been initialized yet.
            const safeMethods = [
                'configureRuntimeEnvironment',
                'clearRuntimeEnvironment',
            ];

            if (!webpackConfig && (safeMethods.indexOf(prop) === -1)) {
                throw new Error(`Encore.${prop}() cannot be called yet because the runtime environment doesn't appear to be configured. Make sure you're using the encore executable or call Encore.configureRuntimeEnvironment() first if you're purposely not calling Encore directly.`);
            }

            // Either a safe method has been called or the webpackConfig
            // object is already available. In this case act as a passthrough.
            return (...parameters) => {
                try {
                    const res = target[prop](...parameters);
                    return (res === target) ? EncoreProxy : res;
                } catch (error) {
                    // prettifies errors thrown by our library
                    const pe = new PrettyError();

                    console.log(pe.render(error));
                    process.exit(1); // eslint-disable-line
                }
            };
        }

        if (typeof target[prop] === 'undefined') {
            // Find the property with the closest Levenshtein distance
            let similarProperty;
            let minDistance = Number.MAX_VALUE;
            for (const apiProperty in target) {
                const distance = levenshtein.get(apiProperty, prop);
                if (distance <= minDistance) {
                    similarProperty = apiProperty;
                    minDistance = distance;
                }
            }

            let errorMessage = `${chalk.red(`Encore.${prop}`)} is not a recognized property or method.`;
            if (minDistance < (prop.length / 3)) {
                errorMessage += ` Did you mean ${chalk.green(`Encore.${similarProperty}`)}?`;
            }

            const error = new Error(errorMessage);
            console.log(new PrettyError().render(error));
            process.exit(1); // eslint-disable-line
        }

        return target[prop];
    }
});

/**
 * @type {Encore}
 */
module.exports = EncoreProxy;
