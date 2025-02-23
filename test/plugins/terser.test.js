/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import { describe, it, expect } from 'vitest';
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
        expect(plugin.options.parallel).to.equal(true);
    });

    it('with options callback', () => {
        const config = createConfig();

        config.configureTerserPlugin((options) => {
            options.test = 'custom_test';
        });

        const plugin = terserPluginUtil(config);

        // Allows to override default options
        expect(plugin.options.test).to.equal('custom_test');

        // Doesn't remove default options
        expect(plugin.options.parallel).to.equal(true);
    });

    it('with options callback that returns an object', () => {
        const config = createConfig();

        config.configureTerserPlugin((options) => {
            options.test = 'custom_test';

            // This should override the original config
            return { parallel: false };
        });

        const plugin = terserPluginUtil(config);
        expect(plugin.options.test).to.not.equal('custom_test');
        expect(plugin.options.parallel).to.equal(false);
    });
});
