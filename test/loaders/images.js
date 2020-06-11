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
const imagesLoader = require('../../lib/loaders/images');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/images', () => {
    it('getLoaders() basic usage', () => {
        const config = createConfig();

        const actualLoaders = imagesLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].loader).to.contain('file-loader');
        expect(actualLoaders[0].options.name).to.equal('images/[name].[hash:8].[ext]');
        expect(actualLoaders[0].options.publicPath).to.equal(config.getRealPublicPath());
    });

    it('getLoaders() with imagemin', () => {
        const config = createConfig();
        config.enableImagemin();

        const actualLoaders = imagesLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[1].loader).to.contain('image-webpack-loader');
        expect(actualLoaders[1].options).to.be.object;
    });

    it('getLoaders() with imagemin config', () => {
        const config = createConfig();
        config.enableImagemin({
            optipng: { enable: false },
        });

        const actualLoaders = imagesLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[1].loader).to.contain('image-webpack-loader');
        expect(actualLoaders[1].options.optipng.enable).to.false;
    });
});
