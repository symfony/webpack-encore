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
const vueLoader = require('../../lib/loaders/vue');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/vue', () => {
    it('getLoaders() with extra options', () => {
        const config = createConfig();
        config.enableVueLoader((options) => {
            options.postLoaders = { foo: 'foo-loader' };
        });

        const actualLoaders = vueLoader.getLoaders(config);

        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.postLoaders.foo).to.equal('foo-loader');
    });

    it('getLoaders() with a callback that returns an object', () => {
        const config = createConfig();
        config.enableVueLoader((options) => {
            options.postLoaders = { foo: 'foo-loader' };

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = vueLoader.getLoaders(config);

        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options).to.deep.equal({ foo: true });
    });
});
