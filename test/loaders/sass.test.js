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
const sassLoader = require('../../lib/loaders/sass');
const cssLoader = require('../../lib/loaders/css');

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
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[0].loader).to.contain('resolve-url-loader');
        expect(actualLoaders[0].options.sourceMap).to.be.true;

        expect(actualLoaders[1].loader).to.contain('sass-loader');
        expect(actualLoaders[1].options.sourceMap).to.be.true;
        expect(cssLoaderStub.mock.calls[0][1]).to.be.false;

        cssLoaderStub.mockRestore();
    });

    it('getLoaders() with resolve-url-loader but not sourcemaps', () => {
        const config = createConfig();
        config.enableSourceMaps(false);

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[0].loader).to.contain('resolve-url-loader');
        expect(actualLoaders[0].options.sourceMap).to.be.false;

        expect(actualLoaders[1].loader).to.contain('sass-loader');
        // sourcemaps always enabled when resolve-url-loader is enabled
        expect(actualLoaders[1].options.sourceMap).to.be.true;

        cssLoaderStub.mockRestore();
    });

    it('getLoaders() with resolve-url-loader options', () => {
        const config = createConfig();
        config.enableSassLoader(() => {}, {
            resolveUrlLoaderOptions: {
                removeCR: true
            }
        });

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[0].loader).to.contain('resolve-url-loader');
        expect(actualLoaders[0].options.removeCR).to.be.true;

        cssLoaderStub.mockRestore();
    });

    it('getLoaders() without resolve-url-loader', () => {
        const config = createConfig();
        config.enableSassLoader(() => {}, {
            resolveUrlLoader: false,
        });
        config.enableSourceMaps(false);

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].loader).to.contain('sass-loader');
        expect(actualLoaders[0].options.sourceMap).to.be.false;

        cssLoaderStub.mockRestore();
    });

    it('getLoaders() with options callback', () => {
        const config = createConfig();

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        config.enableSassLoader(function(options) {
            options.sassOptions.custom_option = 'baz';
            options.sassOptions.other_option = true;
        });

        const actualLoaders = sassLoader.getLoaders(config);

        expect(actualLoaders[1].options).to.deep.equals({
            sourceMap: true,
            sassOptions: {
                outputStyle: 'expanded',
                custom_option: 'baz',
                other_option: true
            }
        });
        cssLoaderStub.mockRestore();
    });

    it('getLoaders() with a callback that returns an object', () => {
        const config = createConfig();

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        config.enableSassLoader(function(options) {
            options.custom_option = 'baz';

            // This should override the original config
            return { foo: true };
        });


        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders[1].options).to.deep.equals({ foo: true });

        cssLoaderStub.mockRestore();
    });

    it('getLoaders() with CSS modules enabled', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = sassLoader.getLoaders(config, true);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[0].loader).to.contain('resolve-url-loader');
        expect(actualLoaders[0].options.sourceMap).to.be.true;

        expect(actualLoaders[1].loader).to.contain('sass-loader');
        expect(actualLoaders[1].options.sourceMap).to.be.true;
        expect(cssLoaderStub.mock.calls[0][1]).to.be.true;

        cssLoaderStub.mockRestore();
    });
});
