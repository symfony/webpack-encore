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

let webpackConfig = null;
let runtimeConfig = require('./lib/context').runtimeConfig;

function initializeWebpackConfig() {
    if (runtimeConfig.verbose) {
        logger.verbose();
    }

    webpackConfig = new WebpackConfig(runtimeConfig);
}

// If runtimeConfig is already set webpackConfig can directly
// be initialized here.
if (runtimeConfig) {
    initializeWebpackConfig();
}

const publicApi = {
    /**
     * The directory where your files should be output.
     *
     * If relative (e.g. /web/build), it will be set relative
     * to the directory where your package.json lives.
     *
     * @param {string} outputPath
     * @return {exports}
     */
    setOutputPath(outputPath) {
        webpackConfig.setOutputPath(outputPath);

        return this;
    },

    /**
     * The public version of outputPath: the public path to outputPath.
     *
     * For example, if "web" is your document root, then:
     *      .setOutputPath('/web/build')
     *      .setPublicPath('/build')
     *
     * This can also be set to an absolute URL if you're using
     * a CDN: publicPath is used as the prefix to all asset paths
     * in the manifest.json file and internally in webpack:
     *      .setOutputPath('/web/build')
     *      .setPublicPath('https://coolcdn.com')
     *      // needed when public path is absolute
     *      .setManifestKeyPrefix('/build')
     *
     * @param {string} publicPath
     * @return {exports}
     */
    setPublicPath(publicPath) {
        webpackConfig.setPublicPath(publicPath);

        return this;
    },

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
     *      .setOutputPath('/web/build')
     *      .setPublicPath('https://coolcdn.com/FOO')
     *      .setManifestKeyPrefix('/build')
     *
     * The manifest.json file would look something like this:
     *
     *      {
     *          "/build/main.js": "https://coolcdn.com/FOO/main.a54f3ccd2.js"
     *      }
     *
     * @param {string} manifestKeyPrefix
     * @return {exports}
     */
    setManifestKeyPrefix(manifestKeyPrefix) {
        webpackConfig.setManifestKeyPrefix(manifestKeyPrefix);

        return this;
    },

    /**
     * Adds a JavaScript file that should be webpacked:
     *
     *      // final output file will be main.js in the output directory
     *      Encore.addEntry('main', './path/to/some_file.js');
     *
     * If the JavaScript file imports/requires CSS/SASS/LESS files,
     * then a CSS file (e.g. main.css) will also be output.
     *
     * @param {string} name       The name (without extension) that will be used
     *                            as the output filename (e.g. app will become app.js)
     *                            in the output directory.
     * @param {string|Array} src  The path to the source file (or files)
     * @returns {exports}
     */
    addEntry(name, src) {
        webpackConfig.addEntry(name, src);

        return this;
    },

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
     * @returns {exports}
     */
    addStyleEntry(name, src) {
        webpackConfig.addStyleEntry(name, src);

        return this;
    },

    /**
     * Add a plugin to the sets of plugins already registered by Encore
     *
     * For example, if you want to add the "webpack.IgnorePlugin()", then:
     *      .addPlugin(new webpack.IgnorePlugin(requestRegExp, contextRegExp))
     *
     * @param {string} plugin
     * @return {exports}
     */
    addPlugin(plugin) {
        webpackConfig.addPlugin(plugin);

        return this;
    },

    /**
     * Adds a custom loader config
     *
     * @param {object} loader The loader config object
     *
     * @returns {exports}
     */
    addLoader(loader) {
        webpackConfig.addLoader(loader);

        return this;
    },

    /**
     * Alias to addLoader
     *
     * @param {object} rule
     *
     * @returns {exports}
     */
    addRule(rule) {
        this.addLoader(rule);

        return this;
    },

    /**
     * When enabled, files are rendered with a hash based
     * on their contents (e.g. main.a2b61cc.js)
     *
     * A manifest.json file will be rendered to the output
     * directory with a map from the original file path to
     * the versioned path (e.g. `builds/main.js` => `builds/main.a2b61cc.js`)
     *
     * @param {boolean} enabled
     * @returns {exports}
     */
    enableVersioning(enabled = true) {
        webpackConfig.enableVersioning(enabled);

        return this;
    },

    /**
     * When enabled, all final CSS and JS files will be rendered
     * with sourcemaps to help debugging.
     *
     * The *type* of source map will differ between a development
     * or production build.
     *
     * @param {boolean} enabled
     * @returns {exports}
     */
    enableSourceMaps(enabled = true) {
        webpackConfig.enableSourceMaps(enabled);

        return this;
    },

    /**
     * Add a "commons" file that holds JS shared by multiple chunks.
     *
     * @param {string} name The chunk name (e.g. vendor to create a vendor.js)
     * @param {Array}  files Array of files to put in the vendor entry
     * @return {exports}
     */
    createSharedEntry(name, files) {
        webpackConfig.createSharedEntry(name, files);

        return this;
    },

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
     * @param {Array} variables
     * @return {exports}
     */
    autoProvideVariables(variables) {
        webpackConfig.autoProvideVariables(variables);

        return this;
    },

    /**
     * Makes jQuery available everywhere. Equivalent to
     *
     *  WebpackConfig.autoProvideVariables({
     *      $: 'jquery',
     *      jQuery: 'jquery'
     *  });
     *
     * @return {exports}
     */
    autoProvidejQuery() {
        webpackConfig.autoProvidejQuery();

        return this;
    },

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
     * @return {exports}
     */
    enablePostCssLoader(postCssLoaderOptionsCallback = () => {}) {
        webpackConfig.enablePostCssLoader(postCssLoaderOptionsCallback);

        return this;
    },

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
     *         // resolve_url_loader: true
     *     });
     *
     * Supported options:
     *      * {bool} resolve_url_loader (default=true)
     *              Whether or not to use the resolve-url-loader.
     *              Setting to false can increase performance in some
     *              cases, especially when using bootstrap_sass. But,
     *              when disabled, all url()'s are resolved relative
     *              to the original entry file... not whatever file
     *              the url() appears in.
     *
     * @param {function} sassLoaderOptionsCallback
     * @param {object} encoreOptions
     * @return {exports}
     */
    enableSassLoader(sassLoaderOptionsCallback = () => {}, encoreOptions = {}) {
        webpackConfig.enableSassLoader(sassLoaderOptionsCallback, encoreOptions);

        return this;
    },

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
     * @return {exports}
     */
    enableLessLoader(lessLoaderOptionsCallback = () => {}) {
        webpackConfig.enableLessLoader(lessLoaderOptionsCallback);

        return this;
    },

    /**
     * Configure babel, without needing a .babelrc file.
     *
     * https://babeljs.io/docs/usage/babelrc/
     *
     * Encore.configureBabel(function(babelConfig) {
     *      // change the babelConfig
     * });
     *
     * @param {function} callback
     * @return {exports}
     */
    configureBabel(callback) {
        webpackConfig.configureBabel(callback);

        return this;
    },

    /**
     * If enabled, the react preset is added to Babel.
     *
     * https://babeljs.io/docs/plugins/preset-react/
     *
     * @returns {exports}
     */
    enableReactPreset() {
        webpackConfig.enableReactPreset();

        return this;
    },

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
     * @return {exports}
     */
    enableTypeScriptLoader(callback = () => {}) {
        webpackConfig.enableTypeScriptLoader(callback);

        return this;
    },

    /**
     * Call this to enable forked type checking for TypeScript loader
     * https://github.com/TypeStrong/ts-loader/blob/v2.3.0/README.md#faster-builds
     *
     * This is a build optimization API to reduce build times.
     *
     * @param {function} forkedTypeScriptTypesCheckOptionsCallback
     * @return {exports}
     */
    enableForkedTypeScriptTypesChecking(forkedTypeScriptTypesCheckOptionsCallback = () => {}) {
        webpackConfig.enableForkedTypeScriptTypesChecking(
            forkedTypeScriptTypesCheckOptionsCallback
        );

        return this;
    },

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
     * @returns {exports}
     */
    enableVueLoader(vueLoaderOptionsCallback = () => {}) {
        webpackConfig.enableVueLoader(vueLoaderOptionsCallback);

        return this;
    },

    /**
     * Call this if you wish to disable the default
     * images loader.
     *
     * @returns {exports}
     */
    disableImagesLoader() {
        webpackConfig.disableImagesLoader();

        return this;
    },

    /**
     * Call this if you wish to disable the default
     * fonts loader.
     *
     * @returns {exports}
     */
    disableFontsLoader() {
        webpackConfig.disableFontsLoader();

        return this;
    },

    /**
     * Call this to change how the name of each output
     * file is generated.
     *
     *     Encore.configureFilenames({
     *         js: '[name].[chunkhash].js',
     *         css: '[name].[contenthash].css',
     *         images: 'images/[name].[hash:8].[ext]',
     *         fonts: 'fonts/[name].[hash:8].[ext]'
     *     });
     *
     * It's safe to omit a key (e.g. css): the default naming strategy
     * will be used for any file types not passed.
     *
     * If you are using Encore.enableVersioning()
     * make sure that your "js" filenames contain
     * "[chunkhash]" and your "css" filenames contain
     * "[contenthash]".
     *
     * @param {object} filenames
     * @returns {exports}
     */
    configureFilenames(filenames) {
        webpackConfig.configureFilenames(filenames);

        return this;
    },

    /**
     * If enabled, the output directory is emptied between
     * each build (to remove old files).
     *
     * @returns {exports}
     */
    cleanupOutputBeforeBuild() {
        webpackConfig.cleanupOutputBeforeBuild();

        return this;
    },

    /**
     * Is this currently a "production" build?
     *
     * @returns {boolean}
     */
    isProduction() {
        return webpackConfig.isProduction();
    },

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
    },

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
    },

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
     * @returns {exports}
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
    },

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
    },
};

// Proxy the API in order to prevent calls to most of its methods
// if the webpackConfig object hasn't been initialized yet.
const publicApiProxy = new Proxy(publicApi, {
    get: (target, prop) => {
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
                    return (res === target) ? publicApiProxy : res;
                } catch (error) {
                    // prettifies errors thrown by our library
                    const pe = new PrettyError();

                    console.log(pe.render(error));
                    process.exit(1); // eslint-disable-line
                }
            };
        }

        return target[prop];
    }
});

module.exports = publicApiProxy;
