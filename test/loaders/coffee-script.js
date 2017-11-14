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
const coffeeScriptLoader = require('../../lib/loaders/coffee-script');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/coffee-script', () => {
    it('getLoaders() with callback', () => {
        const config = createConfig();
        config.enableSourceMaps(true);
        config.enableCoffeeScriptLoader(function(options) {
            options.header = true;
        });

        const loaders = coffeeScriptLoader.getLoaders(config);
        expect(loaders[0].options).to.deep.include({
            sourceMap: true,
            header: true,
        });
    });
});
