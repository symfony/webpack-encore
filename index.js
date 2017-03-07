const WebpackConfig = require('./lib/WebpackConfig');
const config_generator = require('./lib/config_generator');

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

    isProduction() {
        return webpackConfig.isProduction();
    },

    getWebpackConfig() {
        return config_generator(webpackConfig);
    }
};
