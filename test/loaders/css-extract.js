/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { afterAll, afterEach, beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import cssExtractLoader from '../../lib/loaders/css-extract.js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/css-extract', function() {
    it('prependLoaders() basic usage', function() {
        const config = createConfig();

        const loaders = cssExtractLoader.prependLoaders(config, ['foo']);

        expect(loaders).toHaveLength(2);
        expect(loaders[0].loader).toBe(MiniCssExtractPlugin.loader);
    });

    it('prependLoaders() with CSS extraction disabled', function() {
        const config = createConfig();
        config.disableCssExtraction();
        config.enableSourceMaps(true);

        const loaders = cssExtractLoader.prependLoaders(config, ['foo']);

        expect(loaders).toHaveLength(2);
        expect(loaders[0].loader).toContain('style-loader');
    });

    it('prependLoaders() options callback', function() {
        const config = createConfig();
        config.configureMiniCssExtractPlugin(options => {
            options.ignoreOrder = true;
        });

        const loaders = cssExtractLoader.prependLoaders(config, ['foo']);

        expect(loaders).toHaveLength(2);
        expect(loaders[0].loader).toBe(MiniCssExtractPlugin.loader);
        expect(loaders[0].options.ignoreOrder).toBe(true);
    });
});
