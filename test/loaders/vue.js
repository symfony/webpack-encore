/*
 * This file is part of the Symfony package.
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
const vueLoader = require('../../lib/loaders/vue');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/vue', () => {
    it('getLoaders() full usage', () => {
        const config = createConfig();
        config.enableLessLoader();
        config.enableSassLoader();
        config.enableSourceMaps();
        // enable postcss, then really prove that its loader does not show up below
        config.enablePostCssLoader();

        const actualLoaders = vueLoader.getLoaders(config, () => {});
        expect(actualLoaders).to.have.lengthOf(1);
        expect(Object.keys(actualLoaders[0].options.loaders)).to.have.lengthOf(5);

        // postcss should not be added
        expect(JSON.stringify(actualLoaders[0].options.loaders)).to.not.contain('postcss');
        // check for sourcemaps
        expect(JSON.stringify(actualLoaders[0].options.loaders)).to.contain('sourceMap');
    });

    it('getLoaders() with extra options', () => {
        const config = createConfig();

        const actualLoaders = vueLoader.getLoaders(
            config,
            (options) => {
                options.postLoaders = { foo: 'foo-loader' };
            }
        );

        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.postLoaders.foo).to.equal('foo-loader');
    });
});
