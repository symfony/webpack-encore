/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import { describe, it, expect, vi } from 'vitest';
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const lessLoader = require('../../lib/loaders/less');
const cssLoader = require('../../lib/loaders/css');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/less', () => {
    it('getLoaders() basic usage', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = lessLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.sourceMap).to.be.true;
        expect(cssLoaderStub.mock.calls[0][1]).to.be.false;

        cssLoaderStub.mockRestore();
    });

    it('getLoaders() with options callback', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        config.enableLessLoader(function(lessOptions) {
            lessOptions.custom_option = 'foo';
            lessOptions.other_option = true;
        });

        const actualLoaders = lessLoader.getLoaders(config);
        expect(actualLoaders[0].options).to.deep.equals({
            sourceMap: true,
            custom_option: 'foo',
            other_option: true
        });
        cssLoaderStub.mockRestore();
    });

    it('getLoaders() with a callback that returns an object', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        config.enableLessLoader(function(lessOptions) {
            lessOptions.custom_option = 'foo';

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = lessLoader.getLoaders(config);
        expect(actualLoaders[0].options).to.deep.equals({ foo: true });
        cssLoaderStub.mockRestore();
    });

    it('getLoaders() with CSS modules enabled', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = lessLoader.getLoaders(config, true);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.sourceMap).to.be.true;
        expect(cssLoaderStub.mock.calls[0][1]).to.be.true;

        cssLoaderStub.mockRestore();
    });
});
