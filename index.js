/*
 * This file is part of the Symfony package.
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
const runtimeConfig = require('./lib/context').runtimeConfig;

// at this time, the encore executable should have set the runtimeConfig
if (!runtimeConfig) {
    throw new Error('Are you trying to require index.js directly?');
}

const webpackConfig = new WebpackConfig(runtimeConfig);

module.exports = {
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
     * @return {exports}
     */
    enablePostCssLoader() {
        webpackConfig.enablePostCssLoader();

        return this;
    },

    /**
     * Call this if you plan on loading SASS files.
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
     * @param {object} options
     * @return {exports}
     */
    enableSassLoader(options = {}) {
        webpackConfig.enableSassLoader(options);

        return this;
    },

    /**
     * Call this if you plan on loading less files.
     *
     * @return {exports}
     */
    enableLessLoader() {
        webpackConfig.enableLessLoader();

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
     * Encore.enableTypeScriptLoader(function(tsConfig) {
     *      // change the tsConfig
     * });
     *
     * Supported configuration options:
     * @see https://github.com/TypeStrong/ts-loader/blob/master/README.md#available-options
     *
     * @param {function} callback
     * @return {exports}
     */
    enableTypeScriptLoader(callback) {
        webpackConfig.enableTypeScriptLoader(callback);
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
     * @returns {*}
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
        try {
            validator(webpackConfig);

            return configGenerator(webpackConfig);
        } catch (error) {
            // prettifies errors thrown by our library
            const pe = new PrettyError();

            console.log(pe.render(error));
            process.exit(1); // eslint-disable-line
        }
    }
};
