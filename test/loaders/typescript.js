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
import tsLoader from '../../lib/loaders/typescript.js';

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/typescript', function() {
    it('getLoaders() basic usage', async function() {
        const config = createConfig();
        config.enableTypeScriptLoader(function(config) {
            config.foo = 'bar';
        });

        const actualLoaders = await tsLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        // callback is used
        expect(actualLoaders[1].options.foo).to.equal('bar');
    });

    it('getLoaders() check defaults configuration values', async function() {
        const config = createConfig();
        config.enableTypeScriptLoader(function(config) {
            config.foo = 'bar';
        });

        const actualLoaders = await tsLoader.getLoaders(config);
        // callback is used
        expect(actualLoaders[1].options.foo).to.equal('bar');
        // defaults
        expect(actualLoaders[1].options.silent).to.be.true;
    });

    it('getLoaders() with a callback that returns an object', async function() {
        const config = createConfig();
        config.enableTypeScriptLoader(function(config) {
            config.foo = false;

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = await tsLoader.getLoaders(config);
        expect(actualLoaders[1].options).to.deep.equal({ foo: true });
    });
});
