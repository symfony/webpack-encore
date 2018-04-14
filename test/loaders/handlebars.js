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
const handlebarsLoader = require('../../lib/loaders/handlebars');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/handlebars', () => {
    it('getLoaders() basic usage', () => {
        const config = createConfig();
        config.enableHandlebarsLoader();

        const actualLoaders = handlebarsLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options).to.be.empty;
    });

    it('getLoaders() with options callback', () => {
        const config = createConfig();
        config.enableHandlebarsLoader((options) => {
            options.debug = true;
        });

        const actualLoaders = handlebarsLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.debug).to.be.true;
    });

    it('getLoaders() with options callback that returns an object', () => {
        const config = createConfig();
        config.enableHandlebarsLoader((options) => {
            options.debug = true;

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = handlebarsLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options).to.deep.equal({ foo: true });
    });
});
