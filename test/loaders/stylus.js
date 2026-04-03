/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import stylusLoader from '../../lib/loaders/stylus.js';
import cssLoader from '../../lib/loaders/css.js';
import sinon from 'sinon';

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/stylus', function() {
    it('getLoaders() basic usage', function() {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = stylusLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.sourceMap).to.be.true;
        expect(cssLoaderStub.getCall(0).args[1]).to.be.false;

        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with options callback', function() {
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

    it('getLoaders() with a callback that returns an object', function() {
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

    it('getLoaders() with CSS modules enabled', function() {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = stylusLoader.getLoaders(config, true);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.sourceMap).to.be.true;
        expect(cssLoaderStub.getCall(0).args[1]).to.be.true;

        cssLoader.getLoaders.restore();
    });
});
