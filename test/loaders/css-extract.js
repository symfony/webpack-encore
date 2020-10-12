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
const cssExtractLoader = require('../../lib/loaders/css-extract');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/css-extract', () => {
    it('prependLoaders() basic usage', () => {
        const config = createConfig();

        const loaders = cssExtractLoader.prependLoaders(config, ['foo']);

        expect(loaders).to.have.lengthOf(2);
        expect(loaders[0].loader).to.equal(MiniCssExtractPlugin.loader);
        expect(loaders[0].options.hmr).to.be.false;
    });

    it('prependLoaders() with CSS extraction disabled', () => {
        const config = createConfig();
        config.disableCssExtraction();
        config.enableSourceMaps(true);

        const loaders = cssExtractLoader.prependLoaders(config, ['foo']);

        expect(loaders).to.have.lengthOf(2);
        expect(loaders[0].loader).to.contain('style-loader');
    });

    it('prependLoaders() options callback', () => {
        const config = createConfig();
        config.configureMiniCssExtractPlugin(options => {
            options.hmr = true;
        });

        const loaders = cssExtractLoader.prependLoaders(config, ['foo']);

        expect(loaders).to.have.lengthOf(2);
        expect(loaders[0].loader).to.equal(MiniCssExtractPlugin.loader);
        expect(loaders[0].options.hmr).to.be.true;
    });
});
