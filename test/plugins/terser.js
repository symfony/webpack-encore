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
const TerserPlugin = require('terser-webpack-plugin');
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const terserPluginUtil = require('../../lib/plugins/terser');

function createConfig(environment = 'production') {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;
    runtimeConfig.environment = environment;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/terser', () => {
    it('production environment default settings', () => {
        const config = createConfig();

        const plugin = terserPluginUtil(config);
        expect(plugin).to.be.instanceof(TerserPlugin);
        expect(plugin.options.sourceMap).to.equal(false);
    });

    it('with options callback', () => {
        const config = createConfig();

        config.configureTerserPlugin((options) => {
            options.terserOptions = {
                output: { beautify: true }
            };
        });

        const plugin = terserPluginUtil(config);

        // Allows to override default options
        expect(plugin.options.terserOptions.output.beautify).to.equal(true);

        // Doesn't remove default options
        expect(plugin.options.sourceMap).to.equal(false);
    });

    it('with options callback that returns an object', () => {
        const config = createConfig();

        config.configureTerserPlugin((options) => {
            options.terserOptions = {
                output: { beautify: true }
            };

            // This should override the original config
            return { cache: true };
        });

        const plugin = terserPluginUtil(config);
        expect(plugin.options.terserOptions.output.beautify).to.be.undefined;
        expect(plugin.options.cache).to.equal(true);
    });
});
