const expect = require('chai').expect;
const WebpackConfig = require('../lib/WebpackConfig');
const validate = require('../lib/validate-config');
const webpack = require('webpack');

function createConfig() {
    const config = new WebpackConfig();
    config.outputPath = '/tmp/public/build';
    config.setPublicPath('/build');
    config.addEntry('main', './main');

    return config;
}

describe('The validate-config function', () => {
    it('throws an error if there are no entries', () => {
        const config = new WebpackConfig();
        config.publicPath = '/';
        config.outputPath = '/tmp';

        expect(() => {
            validate(config);
        }).to.throw('No entries found!');
    });

    it('throws an error if there is no output path', () => {
        const config = new WebpackConfig();
        config.publicPath = '/';
        config.addEntry('main', './main');

        expect(() => {
            validate(config);
        }).to.throw('Missing output path');
    });

    it('throws an error if there is no public path', () => {
        const config = new WebpackConfig();
        config.outputPath = '/tmp';
        config.addEntry('main', './main');

        expect(() => {
            validate(config);
        }).to.throw('Missing public path');
    });

    it('with absolute publicPath, manifestKeyPrefix must be set', () => {
        const config = createConfig();
        config.setPublicPath('https://cdn.example.com');

        expect(() => {
            validate(config);
        }).to.throw('Cannot determine how to prefix the keys in manifest.json. Call Encore.setManifestKeyPrefix() to choose what path (e.g. /build/) to use');
    });

    it('when outputPath and publicPath are incompatible, manifestKeyPrefix must be set', () => {
        const config = createConfig();
        // pretend we're installed to a subdirectory
        config.setPublicPath('/subdirectory/build');

        expect(() => {
            validate(config);
        }).to.throw('Cannot determine how to prefix the keys in manifest.json. Call Encore.setManifestKeyPrefix() to choose what path (e.g. /build/) to use');
    });

    it('cannot use versioning with webpack-dev-server', () => {
        const config = createConfig();
        config.enableVersioning();
        config.useWebpackDevServer();

        expect(() => {
            validate(config);
        }).to.throw('Don\'t enable versioning with useWebpackDevServer()');
    });
});
