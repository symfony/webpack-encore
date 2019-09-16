/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const expect = require('chai').expect;
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const sassLoader = require('../../lib/loaders/sass');
const cssLoader = require('../../lib/loaders/css');
const sinon = require('sinon');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/sass', () => {
    it('getLoaders() basic usage', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[0].loader).to.equal('resolve-url-loader');
        expect(actualLoaders[0].options.sourceMap).to.be.true;

        expect(actualLoaders[1].loader).to.equal('sass-loader');
        expect(actualLoaders[1].options.sourceMap).to.be.true;
        expect(cssLoaderStub.getCall(0).args[1]).to.be.false;

        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with resolve-url-loader but not sourcemaps', () => {
        const config = createConfig();
        config.enableSourceMaps(false);

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[0].loader).to.equal('resolve-url-loader');
        expect(actualLoaders[0].options.sourceMap).to.be.false;

        expect(actualLoaders[1].loader).to.equal('sass-loader');
        // sourcemaps always enabled when resolve-url-loader is enabled
        expect(actualLoaders[1].options.sourceMap).to.be.true;

        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with resolve-url-loader options', () => {
        const config = createConfig();
        config.enableSassLoader(() => {}, {
            resolveUrlLoaderOptions: {
                removeCR: true
            }
        });

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[0].loader).to.equal('resolve-url-loader');
        expect(actualLoaders[0].options.removeCR).to.be.true;

        cssLoader.getLoaders.restore();
    });

    it('getLoaders() without resolve-url-loader', () => {
        const config = createConfig();
        config.enableSassLoader(() => {}, {
            resolveUrlLoader: false,
        });
        config.enableSourceMaps(false);

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].loader).to.equal('sass-loader');
        expect(actualLoaders[0].options.sourceMap).to.be.false;

        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with options callback', () => {
        const config = createConfig();

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        config.enableSassLoader(function(sassOptions) {
            sassOptions.custom_optiona = 'baz';
            sassOptions.other_option = true;
        });

        const actualLoaders = sassLoader.getLoaders(config);

        expect(actualLoaders[1].options).to.deep.equals({
            sourceMap: true,
            outputStyle: 'expanded',
            custom_optiona: 'baz',
            other_option: true
        });
        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with a callback that returns an object', () => {
        const config = createConfig();

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        config.enableSassLoader(function(sassOptions) {
            sassOptions.custom_option = 'baz';

            // This should override the original config
            return { foo: true };
        });


        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders[1].options).to.deep.equals({ foo: true });

        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with CSS modules enabled', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = sassLoader.getLoaders(config, true);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[0].loader).to.equal('resolve-url-loader');
        expect(actualLoaders[0].options.sourceMap).to.be.true;

        expect(actualLoaders[1].loader).to.equal('sass-loader');
        expect(actualLoaders[1].options.sourceMap).to.be.true;
        expect(cssLoaderStub.getCall(0).args[1]).to.be.true;

        cssLoader.getLoaders.restore();
    });
});
