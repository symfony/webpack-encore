/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import handlebarsLoader from '../../lib/loaders/handlebars.js';

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/handlebars', function() {
    it('getLoaders() basic usage', function() {
        const config = createConfig();
        config.enableHandlebarsLoader();

        const actualLoaders = handlebarsLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options).to.be.empty;
    });

    it('getLoaders() with options callback', function() {
        const config = createConfig();
        config.enableHandlebarsLoader((options) => {
            options.debug = true;
        });

        const actualLoaders = handlebarsLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.debug).to.be.true;
    });

    it('getLoaders() with options callback that returns an object', function() {
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
