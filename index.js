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

    addEntry(name, src) {
        webpackConfig.addEntry(name, src);

        return this;
    },

    addStyleEntry(name, src) {
        webpackConfig.addStyleEntry(name, src);

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
        webpack.cleanupOutputBeforeBuild()
    },

    isProduction() {
        return webpackConfig.isProduction();
    },

    getWebpackConfig() {
        return configGenerator(webpackConfig);
    }
};
