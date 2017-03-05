const Remix = require('./lib/Remix');
const config_generator = require('./lib/config_generator');

remix = new Remix();

module.exports = {
    setOutputPath(outputPath) {
        remix.setOutputPath(outputPath);

        return this;
    },

    setPublicPath(publicPath) {
        remix.setPublicPath(publicPath);

        return this;
    },

    setPublicCDNPath(publicCDNPath) {
        remix.setPublicCDNPath(publicCDNPath);

        return this;
    },

    addEntry(name, src) {
        remix.addEntry(name, src);

        return this;
    },

    addStylesEntry(name, src) {
        remix.addStylesEntry(name, src);

        return this;
    },

    enableVersioning(enabled = true) {
        remix.enableVersioning(enabled);

        return this;
    },

    enableSourceMaps(enabled = true) {
        remix.enableSourceMaps(enabled);

        return this;
    },

    extractVendorEntry(name, files) {
        remix.extractVendorEntry(name, files);

        return this;
    },

    autoProvideVariables(variables) {
        remix.autoProvideVariables(variables);

        return this;
    },

    autoProvidejQuery() {
        remix.autoProvidejQuery();

        return this;
    },

    isProduction() {
        return remix.isProduction();
    },

    getWebpackConfig() {
        return config_generator(remix);
    }
};
