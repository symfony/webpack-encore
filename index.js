const WebpackConfig = require('./lib/WebpackConfig');
const configGenerator = require('./lib/config-generator');

webpackConfig = new WebpackConfig();

module.exports = {
    setOutputPath(outputPath) {
        webpackConfig.setOutputPath(outputPath);

        return this;
    },

    setPublicPath(publicPath) {
        webpackConfig.setPublicPath(publicPath);

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
     *      Remix.setContext(__dirname);
     *
     * @param context
     */
    setContext(context) {
        webpackConfig.setContext(context);

        return this;
    },

    setPublicCDNPath(publicCDNPath) {
        webpackConfig.setPublicCDNPath(publicCDNPath);

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
     * @param {string} webpackDevServerUrl
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
    enablePostCss(enabled = true) {
        webpackConfig.enablePostCss(enabled);

        return this;
    },

    enableLess(enabled = true) {
        webpackConfig.enableLess(enabled);

        return this;
    },

    /**
     * Configure babel, without needing a .babelrc file.
     *
     * https://babeljs.io/docs/usage/babelrc/
     *
     * Remix.configureBabel(function(babelConfig) {
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

    enableReact(enabled = true) {
        webpackConfig.enableReact(enabled);

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
        return configGenerator(webpackConfig);
    }
};
