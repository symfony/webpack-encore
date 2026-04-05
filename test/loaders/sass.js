/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, it, expect } from 'vitest';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import sassLoader from '../../lib/loaders/sass.js';
import cssLoader from '../../lib/loaders/css.js';


function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/sass', function() {
    it('getLoaders() basic usage', function() {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).toHaveLength(2);
        expect(actualLoaders[0].loader).toContain('resolve-url-loader');
        expect(actualLoaders[0].options.sourceMap).toBe(true);

        expect(actualLoaders[1].loader).toContain('sass-loader');
        expect(actualLoaders[1].options.sourceMap).toBe(true);
        expect(cssLoaderStub.mock.calls[0][1]).toBe(false);


        cssLoader.getLoaders;
    });

    it('getLoaders() with resolve-url-loader but not sourcemaps', function() {
        const config = createConfig();
        config.enableSourceMaps(false);

        // make the cssLoader return nothing
        vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).toHaveLength(2);
        expect(actualLoaders[0].loader).toContain('resolve-url-loader');
        expect(actualLoaders[0].options.sourceMap).toBe(false);

        expect(actualLoaders[1].loader).toContain('sass-loader');
        // sourcemaps always enabled when resolve-url-loader is enabled
        expect(actualLoaders[1].options.sourceMap).toBe(true);

        cssLoader.getLoaders;
    });

    it('getLoaders() with resolve-url-loader options', function() {
        const config = createConfig();
        config.enableSassLoader(() => {}, {
            resolveUrlLoaderOptions: {
                removeCR: true
            }
        });

        // make the cssLoader return nothing
        vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).toHaveLength(2);
        expect(actualLoaders[0].loader).toContain('resolve-url-loader');
        expect(actualLoaders[0].options.removeCR).toBe(true);

        cssLoader.getLoaders;
    });

    it('getLoaders() without resolve-url-loader', function() {
        const config = createConfig();
        config.enableSassLoader(() => {}, {
            resolveUrlLoader: false,
        });
        config.enableSourceMaps(false);

        // make the cssLoader return nothing
        vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).toHaveLength(1);
        expect(actualLoaders[0].loader).toContain('sass-loader');
        expect(actualLoaders[0].options.sourceMap).toBe(false);

        cssLoader.getLoaders;
    });

    it('getLoaders() with options callback', function() {
        const config = createConfig();

        // make the cssLoader return nothing
        vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        config.enableSassLoader(function(options) {
            options.sassOptions.custom_option = 'baz';
            options.sassOptions.other_option = true;
        });

        const actualLoaders = sassLoader.getLoaders(config);

        expect(actualLoaders[1].options).toEqual({
            sourceMap: true,
            sassOptions: {
                outputStyle: 'expanded',
                custom_option: 'baz',
                other_option: true
            }
        });
        cssLoader.getLoaders;
    });

    it('getLoaders() with a callback that returns an object', function() {
        const config = createConfig();

        // make the cssLoader return nothing
        vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        config.enableSassLoader(function(options) {
            options.custom_option = 'baz';

            // This should override the original config
            return { foo: true };
        });


        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders[1].options).toEqual({ foo: true });

        cssLoader.getLoaders;
    });

    it('getLoaders() with CSS modules enabled', function() {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = vi.spyOn(cssLoader, 'getLoaders')
            .mockImplementation(() => []);

        const actualLoaders = sassLoader.getLoaders(config, true);
        expect(actualLoaders).toHaveLength(2);
        expect(actualLoaders[0].loader).toContain('resolve-url-loader');
        expect(actualLoaders[0].options.sourceMap).toBe(true);

        expect(actualLoaders[1].loader).toContain('sass-loader');
        expect(actualLoaders[1].options.sourceMap).toBe(true);
        expect(cssLoaderStub.mock.calls[0][1]).toBe(true);


        cssLoader.getLoaders;
    });
});
