const WebpackConfig = require('./lib/WebpackConfig');
const configGenerator = require('./lib/config-generator');
const validator = require('./lib/validate-config');
const PrettyError = require('pretty-error');
const commandConfig = require('./lib/command-config');

webpackConfig = new WebpackConfig();

// determine the environment
let environment = commandConfig.environment;
if (environment === null) {
    environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
}
webpackConfig.setEnvironment(environment);

if (commandConfig.useDevServer) {
    // todo - allow URL to be passed in
    webpackConfig.useWebpackDevServer(commandConfig.devServerUrl);
}

module.exports = {
    /**
     * The directory where your files should be output.
     *
     * If relative (e.g. /web/build), it will be set relative
     * to the directory where your package.json lives.
     *
     * @param {string} outputPath
     * @returns {exports}
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
     * @returns {exports}
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
     * @returns {exports}
     */
    setManifestKeyPrefix(manifestKeyPrefix) {
        webpackConfig.setManifestKeyPrefix(manifestKeyPrefix);

        return this;
    },

    /**
     * Advanced: manually set the webpack "context".
     *
     * This should only be necessary if you plan on running
     * webpack from a directory outside of your project.
     *
     * The context specifies the "root" path - all other
     * paths (e.g. used in addEntry()) are relative to
     * the context.
     *
     *      // webpack.config.js
     *      // guarantee the context is your root directory
     *      Encore.setContext(__dirname);
     *
     * @param context
     */
    setContext(context) {
        webpackConfig.setContext(context);

        return this;
    },

    addEntry(name, src) {
        webpackConfig.addEntry(name, src);

        return this;
    },

    addStyleEntry(name, src) {
        webpackConfig.addStyleEntry(name, src);

        return this;
    },

    /**
     * Call this to use the webpack-dev-server
     *
     * This will initialize the needed devServer config
     * and point the URLs to the webpackDevServerUrl
     * (http://localhost:8080 by default).
     *
     * Be sure to execute the webpack-dev-server when this
     * option is set:
     *
     *     ./node_modules/.bin/webpack-dev-server --hot --inline
     *
     * False can be passed as an argument to disable the dev server.
     *
     * @param {string|bool} webpackDevServerUrl
     * @returns {exports}
     */
    useWebpackDevServer(webpackDevServerUrl = null) {
        webpackConfig.useWebpackDevServer(webpackDevServerUrl);

        return this;
    },

    enableVersioning(enabled = true) {
        webpackConfig.enableVersioning(enabled);

        return this;
    },

    enableSourceMaps(enabled = true) {
        webpackConfig.enableSourceMaps(enabled);

        return this;
    },

    createSharedEntry(name, files) {
        webpackConfig.createSharedEntry(name, files);

        return this;
    },

    autoProvideVariables(variables) {
        webpackConfig.autoProvideVariables(variables);

        return this;
    },

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
     */
    enablePostCssLoader(enabled = true) {
        webpackConfig.enablePostCssLoader(enabled);

        return this;
    },

    /**
     * Call this if you plan on loading SASS files.
     *
     * @param enabled
     * @returns {exports}
     */
    enableSassLoader(enabled = true) {
        webpackConfig.enableSassLoader(enabled);

        return this;
    },

    /**
     * Call this if you plan on loading less files.
     *
     * @param enabled
     * @returns {exports}
     */
    enableLessLoader(enabled = true) {
        webpackConfig.enableLessLoader(enabled);

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
     */
    configureBabel(callback) {
        webpackConfig.configureBabel(callback);

        return this;
    },

    /**
     * Should the babel-loader be allowed to load config from
     * a .babelrc file?
     *
     * @param shouldUse
     */
    useBabelRcFile(shouldUse = true) {
        webpackConfig.useBabelRcFile(shouldUse);

        return this;
    },

    enableReactPreset(enabled = true) {
        webpackConfig.enableReactPreset(enabled);

        return this;
    },

    cleanupOutputBeforeBuild() {
        webpackConfig.cleanupOutputBeforeBuild();

        return this;
    },

    isProduction() {
        return webpackConfig.isProduction();
    },

    getWebpackConfig() {
        try {
            validator(webpackConfig);

            return configGenerator(webpackConfig);
        } catch (error) {
            // prettifies errors thrown by our library
            const pe = new PrettyError();
            pe.appendStyle({
                // hides the full paths below each stack item
                'pretty-error > trace': {
                   display: 'none'
                }
            });

            console.log(pe.render(error));
            process.exit(1);
        }
    }
};
