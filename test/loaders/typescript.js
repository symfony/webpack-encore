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
const tsLoader = require('../../lib/loaders/typescript');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/typescript', () => {
    it('getLoaders() basic usage', () => {
        const config = createConfig();
        config.enableTypeScriptLoader(function(config) {
            config.foo = 'bar';
        });

        const actualLoaders = tsLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        // callback is used
        expect(actualLoaders[1].options.foo).to.equal('bar');
    });

    it('getLoaders() check defaults configuration values', () => {
        const config = createConfig();
        config.enableTypeScriptLoader(function(config) {
            config.foo = 'bar';
        });

        const actualLoaders = tsLoader.getLoaders(config);
        // callback is used
        expect(actualLoaders[1].options.foo).to.equal('bar');
        // defaults
        expect(actualLoaders[1].options.silent).to.be.true;
    });

    it('getLoaders() with a callback that returns an object', () => {
        const config = createConfig();
        config.enableTypeScriptLoader(function(config) {
            config.foo = false;

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = tsLoader.getLoaders(config);
        expect(actualLoaders[1].options).to.deep.equal({ foo: true });
    });
});
