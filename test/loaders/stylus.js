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
const stylusLoader = require('../../lib/loaders/stylus');
const cssLoader = require('../../lib/loaders/css');
const sinon = require('sinon');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/stylus', () => {
    it('getLoaders() basic usage', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = stylusLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.sourceMap).to.be.true;

        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with options callback', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        config.enableStylusLoader(function(stylusOptions) {
            stylusOptions.custom_option = 'foo';
            stylusOptions.other_option = true;
        });

        const actualLoaders = stylusLoader.getLoaders(config);
        expect(actualLoaders[0].options).to.deep.equals({
            sourceMap: true,
            custom_option: 'foo',
            other_option: true
        });
        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with a callback that returns an object', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        config.enableStylusLoader(function(stylusOptions) {
            stylusOptions.custom_option = 'foo';

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = stylusLoader.getLoaders(config);
        expect(actualLoaders[0].options).to.deep.equals({ foo: true });
        cssLoader.getLoaders.restore();
    });
});
