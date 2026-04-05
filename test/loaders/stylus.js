/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { vi, describe, it, expect } from 'vitest';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import stylusLoader from '../../lib/loaders/stylus.js';
import cssLoader from '../../lib/loaders/css.js';


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
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = stylusLoader.getLoaders(config);
        expect(actualLoaders).toHaveLength(1);
        expect(actualLoaders[0].options.sourceMap).toBe(true);
        expect(cssLoaderStub.mock.calls[0][1]).toBe(false);

        cssLoader.getLoaders;
    });

    it('getLoaders() with options callback', function() {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        config.enableStylusLoader(function(stylusOptions) {
            stylusOptions.custom_option = 'foo';
            stylusOptions.other_option = true;
        });

        const actualLoaders = stylusLoader.getLoaders(config);
        expect(actualLoaders[0].options).toEqual({
            sourceMap: true,
            custom_option: 'foo',
            other_option: true
        });
        cssLoader.getLoaders;
    });

    it('getLoaders() with a callback that returns an object', function() {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        config.enableStylusLoader(function(stylusOptions) {
            stylusOptions.custom_option = 'foo';

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = stylusLoader.getLoaders(config);
        expect(actualLoaders[0].options).toEqual({ foo: true });
        cssLoader.getLoaders;
    });

    it('getLoaders() with CSS modules enabled', function() {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = stylusLoader.getLoaders(config, true);
        expect(actualLoaders).toHaveLength(1);
        expect(actualLoaders[0].options.sourceMap).toBe(true);
        expect(cssLoaderStub.mock.calls[0][1]).toBe(true);

        cssLoader.getLoaders;
    });
});
